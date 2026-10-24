// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createExpressApp } from '../app';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

const DELCOM_BASE = 'https://open-api.delcom.org/api/v1';

// Keep a reference to the real fetch: the test client uses it to call the local
// server, while the stub below only intercepts the proxy's outbound request.
const realFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function startServer() {
  const app = createExpressApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

describe('Delcom API proxy (/api-proxy)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let srv: Awaited<ReturnType<typeof startServer>>;

  beforeEach(async () => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    srv = await startServer();
  });

  afterEach(async () => {
    await srv.close();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('forwards a GET request to the Delcom base URL, keeping the path and query string', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', data: { id: 1 } }));

    const res = await realFetch(`${srv.baseUrl}/api-proxy/users/profile?verbose=1`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASE}/users/profile?verbose=1`);
    expect(options.method).toBe('GET');
    expect(options.body).toBeUndefined();
    expect(options.headers).toEqual({ Accept: 'application/json' });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'success', data: { id: 1 } });
  });

  it('forwards Authorization and Content-Type headers to Delcom', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success' }));

    await realFetch(`${srv.baseUrl}/api-proxy/users`, {
      headers: { Authorization: 'Bearer token-abc', 'Content-Type': 'application/json' },
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer token-abc',
      'Content-Type': 'application/json',
    });
  });

  it('serializes the JSON body for POST requests', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success' }, 201));

    const payload = { name: 'Budi', email: 'budi@example.com' };
    const res = await realFetch(`${srv.baseUrl}/api-proxy/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASE}/users/register`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(res.status).toBe(201);
  });

  it('does not send a body for POST requests with an empty JSON object', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success' }));

    await realFetch(`${srv.baseUrl}/api-proxy/trips/empty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBeUndefined();
  });

  it('does not send a body for DELETE requests even when one is provided', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success' }));

    await realFetch(`${srv.baseUrl}/api-proxy/trips/9`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force: true }),
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('DELETE');
    expect(options.body).toBeUndefined();
  });

  it('wraps a non-JSON upstream body into a fail payload with the raw text as message', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

    const res = await realFetch(`${srv.baseUrl}/api-proxy/cities`);

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ status: 'fail', message: '<html>Bad Gateway</html>' });
  });

  it('uses the default Indonesian message when a non-JSON upstream body is empty', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 503 }));

    const res = await realFetch(`${srv.baseUrl}/api-proxy/cities`);

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      status: 'fail',
      message: 'Format tanggapan server tidak valid',
    });
  });

  it('returns 500 with the error message when the upstream request throws an Error', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await realFetch(`${srv.baseUrl}/api-proxy/users`);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ status: 'fail', message: 'ECONNREFUSED' });
    expect(console.error).toHaveBeenCalledWith(
      'Delcom API Proxy Error:',
      expect.any(Error)
    );
  });

  it('returns 500 with a generic message when the upstream throws a non-Error value', async () => {
    fetchMock.mockRejectedValue('network down');

    const res = await realFetch(`${srv.baseUrl}/api-proxy/users`);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      status: 'fail',
      message: 'Terjadi kesalahan pada server proxy',
    });
  });
});
