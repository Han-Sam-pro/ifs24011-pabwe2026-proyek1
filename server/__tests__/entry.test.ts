// @vitest-environment node
import path from 'path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { fakeApp, createViteServer, viteMiddlewares } = vi.hoisted(() => {
  const viteMiddlewares = vi.fn();
  return {
    viteMiddlewares,
    createViteServer: vi.fn(async () => ({ middlewares: viteMiddlewares })),
    fakeApp: {
      use: vi.fn(),
      get: vi.fn(),
      listen: vi.fn((_port: number, _host: string, cb?: () => void) => cb?.()),
    },
  };
});

vi.mock('../app', () => ({
  createExpressApp: vi.fn(() => fakeApp),
}));

vi.mock('vite', () => ({
  createServer: createViteServer,
}));

const originalEnv = { NODE_ENV: process.env.NODE_ENV, PORT: process.env.PORT };

async function loadEntry() {
  vi.resetModules();
  await import('../../server');
  await vi.waitFor(() => expect(fakeApp.listen).toHaveBeenCalled());
}

describe('server.ts entry point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PORT;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    if (originalEnv.PORT === undefined) delete process.env.PORT;
    else process.env.PORT = originalEnv.PORT;
    vi.restoreAllMocks();
  });

  it('in development mounts the Vite dev server as middleware and listens on port 3000', async () => {
    process.env.NODE_ENV = 'development';
    await loadEntry();

    expect(createViteServer).toHaveBeenCalledWith({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    expect(fakeApp.use).toHaveBeenCalledWith(viteMiddlewares);
    expect(fakeApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0', expect.any(Function));
  });

  it('uses the PORT environment variable when provided', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '4567';
    await loadEntry();

    expect(fakeApp.listen).toHaveBeenCalledWith(4567, '0.0.0.0', expect.any(Function));
    expect(createViteServer).toHaveBeenCalledWith(
      expect.objectContaining({ server: expect.objectContaining({ port: 4567 }) })
    );
  });

  it('logs the running address once the server is listening', async () => {
    process.env.NODE_ENV = 'development';
    await loadEntry();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('http://0.0.0.0:3000')
    );
  });

  it('in production serves the static dist folder and falls back to index.html', async () => {
    process.env.NODE_ENV = 'production';
    await loadEntry();

    expect(createViteServer).not.toHaveBeenCalled();
    expect(fakeApp.use).toHaveBeenCalledTimes(1);
    expect(fakeApp.get).toHaveBeenCalledWith('*', expect.any(Function));

    const handler = fakeApp.get.mock.calls[0][1];
    const res = { sendFile: vi.fn() };
    handler({}, res);

    expect(res.sendFile).toHaveBeenCalledTimes(1);
    const sentPath: string = res.sendFile.mock.calls[0][0];
    expect(path.normalize(sentPath)).toMatch(/dist[\\/]index\.html$/);
    expect(fakeApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0', expect.any(Function));
  });

  it('exits the process with code 1 when the Vite dev server fails to start', async () => {
    process.env.NODE_ENV = 'development';
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as unknown as typeof process.exit);
    const boom = new Error('vite boot failed');
    createViteServer.mockRejectedValueOnce(boom);

    vi.resetModules();
    await import('../../server');
    await vi.waitFor(() => expect(exitSpy).toHaveBeenCalledWith(1));

    expect(console.error).toHaveBeenCalledWith('Failed to start Express server:', boom);
    expect(fakeApp.listen).not.toHaveBeenCalled();
  });
});
