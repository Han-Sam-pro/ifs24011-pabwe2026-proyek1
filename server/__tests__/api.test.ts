// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createExpressApp } from '../app';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

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

describe('API router (/api)', () => {
  let srv: Awaited<ReturnType<typeof startServer>> | undefined;

  afterEach(async () => {
    await srv?.close();
    srv = undefined;
    vi.restoreAllMocks();
  });

  it('GET /api/health returns ok status with framework info and ISO timestamp', async () => {
    srv = await startServer();
    const res = await fetch(`${srv.baseUrl}/api/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.framework).toBe('Express.js (Modular Backend)');
    expect(body.message).toContain('RoamPlan');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('GET /api/cities/suggest returns empty list when query is missing or blank', async () => {
    srv = await startServer();

    const noQuery = await (await fetch(`${srv.baseUrl}/api/cities/suggest`)).json();
    expect(noQuery).toEqual({ cities: [] });

    const blank = await (await fetch(`${srv.baseUrl}/api/cities/suggest?q=%20%20`)).json();
    expect(blank).toEqual({ cities: [] });
  });

  it('matches cities by city name case-insensitively with coordinates', async () => {
    srv = await startServer();
    const body = await (await fetch(`${srv.baseUrl}/api/cities/suggest?q=YOGYA`)).json();

    expect(body.cities).toEqual([
      { cityName: 'Yogyakarta', country: 'Indonesia', lat: -7.7956, lng: 110.3695 },
    ]);
  });

  it('matches cities by country name and returns every city in that country', async () => {
    srv = await startServer();
    const body = await (await fetch(`${srv.baseUrl}/api/cities/suggest?q=indonesia`)).json();

    expect(body.cities.length).toBeGreaterThan(1);
    expect(body.cities.every((c: { country: string }) => c.country === 'Indonesia')).toBe(true);
    expect(body.cities.map((c: { cityName: string }) => c.cityName)).toContain('Bali');
  });

  it('matches partial query text and trims surrounding whitespace', async () => {
    srv = await startServer();
    const body = await (await fetch(`${srv.baseUrl}/api/cities/suggest?q=%20ap%20`)).json();

    // "ap" matches Singapore by name and Tokyo via its country (Japan)
    const names = body.cities.map((c: { cityName: string }) => c.cityName);
    expect(names).toEqual(['Singapore', 'Tokyo']);
  });

  it('returns an empty list when nothing matches the query', async () => {
    srv = await startServer();
    const body = await (await fetch(`${srv.baseUrl}/api/cities/suggest?q=zzzz-tidak-ada`)).json();
    expect(body).toEqual({ cities: [] });
  });

  it('treats an array-valued q parameter as a string without crashing', async () => {
    srv = await startServer();
    const res = await fetch(`${srv.baseUrl}/api/cities/suggest?q=tokyo&q=bali`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.cities)).toBe(true);
  });
});
