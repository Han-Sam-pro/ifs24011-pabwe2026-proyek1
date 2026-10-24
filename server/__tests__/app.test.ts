// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createExpressApp } from '../app';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

async function listen(app: ReturnType<typeof createExpressApp>) {
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

const realFetch = globalThis.fetch;

describe('createExpressApp', () => {
  let srv: Awaited<ReturnType<typeof listen>> | undefined;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await srv?.close();
    srv = undefined;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns a new Express application instance on every call', () => {
    const a = createExpressApp();
    const b = createExpressApp();
    expect(a).not.toBe(b);
    expect(typeof a.listen).toBe('function');
  });

  it('mounts the API router under /api', async () => {
    srv = await listen(createExpressApp());
    const res = await realFetch(`${srv.baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
  });

  it('mounts the Delcom proxy under /api-proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    srv = await listen(createExpressApp());
    const res = await realFetch(`${srv.baseUrl}/api-proxy/cities`);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://open-api.delcom.org/api/v1/cities',
      expect.objectContaining({ method: 'GET' })
    );
    expect(await res.json()).toEqual({ status: 'success' });
  });

  it('parses JSON request bodies (express.json) before routing to the proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    srv = await listen(createExpressApp());
    await realFetch(`${srv.baseUrl}/api-proxy/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Trip Jogja' }),
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ title: 'Trip Jogja' });
  });

  it('returns 404 for unknown paths outside /api and /api-proxy', async () => {
    srv = await listen(createExpressApp());
    const res = await realFetch(`${srv.baseUrl}/tidak-ada`);
    expect(res.status).toBe(404);
  });
});
