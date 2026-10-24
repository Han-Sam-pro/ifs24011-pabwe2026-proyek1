import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';

const { mockAxeRun } = vi.hoisted(() => ({
  mockAxeRun: vi.fn(),
}));

vi.mock('../App', () => ({
  default: () => <div>APP-STUB</div>,
}));

vi.mock('axe-core', () => ({
  default: { run: mockAxeRun },
}));

describe('main.tsx bootstrap', () => {
  let originalConsoleError: typeof console.error;
  let consoleErrorSpy: ReturnType<typeof vi.fn>;
  let container: HTMLDivElement;

  async function bootstrap() {
    vi.resetModules();
    console.error = consoleErrorSpy as unknown as typeof console.error;
    await import('../main');
  }

  beforeEach(() => {
    originalConsoleError = console.error;
    consoleErrorSpy = vi.fn();
    mockAxeRun.mockReset();
    mockAxeRun.mockResolvedValue({ violations: [] });

    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error = originalConsoleError;
    container.remove();
    delete (window as any).gm_authFailure;
    vi.restoreAllMocks();
  });

  it('renders the App component into the #root element', async () => {
    await bootstrap();

    await waitFor(() => expect(container).toHaveTextContent('APP-STUB'));
  });

  it('exposes window.gm_authFailure which dispatches a gmp-quota-exceeded event', async () => {
    await bootstrap();
    const listener = vi.fn();
    window.addEventListener('gmp-quota-exceeded', listener);

    (window as any).gm_authFailure();

    window.removeEventListener('gmp-quota-exceeded', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('dispatches gmp-quota-exceeded when console.error reports OverQuotaMapError', async () => {
    await bootstrap();
    const listener = vi.fn();
    window.addEventListener('gmp-quota-exceeded', listener);

    console.error('Google Maps error', 'OverQuotaMapError: limit reached');

    window.removeEventListener('gmp-quota-exceeded', listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Google Maps error',
      'OverQuotaMapError: limit reached'
    );
  });

  it('dispatches gmp-quota-exceeded when console.error reports QuotaExceededError', async () => {
    await bootstrap();
    const listener = vi.fn();
    window.addEventListener('gmp-quota-exceeded', listener);

    console.error(new Error('QuotaExceededError while saving'));

    window.removeEventListener('gmp-quota-exceeded', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch gmp-quota-exceeded for unrelated console errors but still forwards them', async () => {
    await bootstrap();
    const listener = vi.fn();
    window.addEventListener('gmp-quota-exceeded', listener);

    console.error('Something else failed');

    window.removeEventListener('gmp-quota-exceeded', listener);
    expect(listener).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Something else failed');
  });

  it('runs the axe accessibility audit in dev and logs that there are no violations', async () => {
    await bootstrap();

    await waitFor(
      () => expect(console.info).toHaveBeenCalledWith('[Axe A11y] Audit lolos: 0 pelanggaran aksesibilitas.'),
      { timeout: 4000 }
    );
    expect((window as any).axe).toBeDefined();
    expect(mockAxeRun).toHaveBeenCalledWith(document, { reporter: 'v2' });
  });

  it('groups and lists accessibility violations found by axe', async () => {
    mockAxeRun.mockResolvedValue({
      violations: [
        { impact: 'serious', help: 'Images must have alt text', nodes: [{ target: ['img'] }] },
      ],
    });
    await bootstrap();

    await waitFor(() => expect(console.groupCollapsed).toHaveBeenCalled(), { timeout: 4000 });
    expect(console.groupCollapsed).toHaveBeenCalledWith(
      '[Axe A11y] 1 catatan aksesibilitas ditemukan:'
    );
    expect(console.info).toHaveBeenCalledWith(
      '- [SERIOUS] Images must have alt text:',
      [{ target: ['img'] }]
    );
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('logs a debug message when the axe audit promise rejects', async () => {
    const failure = new Error('audit crashed');
    mockAxeRun.mockRejectedValue(failure);
    await bootstrap();

    await waitFor(
      () => expect(console.debug).toHaveBeenCalledWith('Axe audit error:', failure),
      { timeout: 4000 }
    );
  });
});
