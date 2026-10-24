// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// The script writes to <project>/public. Mock fs so the test never overwrites
// the real deliverable in public/ and can inspect what would be written.
const { fsMock } = vi.hoisted(() => ({
  fsMock: {
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
  },
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const merged = { ...actual, ...fsMock };
  return { ...merged, default: merged };
});

const OUTPUT_FILE = 'Dokumen_Proyek_1_PABWE_11S24011_Johan_Samosir.docx';

async function runScript() {
  vi.resetModules();
  await import('../../generate_report_docx.js');
  await vi.waitFor(() => expect(fsMock.writeFileSync).toHaveBeenCalled(), { timeout: 15000 });
}

describe('generate_report_docx.js', () => {
  beforeEach(() => {
    fsMock.writeFileSync.mockClear();
    fsMock.mkdirSync.mockClear();
    fsMock.existsSync.mockReset();
    fsMock.existsSync.mockReturnValue(true);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes a DOCX (zip container) buffer to the public folder', async () => {
    await runScript();

    const [target, buffer] = fsMock.writeFileSync.mock.calls[0];
    expect(path.normalize(target)).toMatch(new RegExp(`public[\\\\/]${OUTPUT_FILE.replace(/\./g, '\\.')}$`));
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
    // DOCX files are zip archives and start with the "PK" signature
    expect(buffer.subarray(0, 2).toString('ascii')).toBe('PK');
  });

  it('does not create the public folder when it already exists', async () => {
    fsMock.existsSync.mockReturnValue(true);

    await runScript();

    expect(fsMock.mkdirSync).not.toHaveBeenCalled();
  });

  it('creates the public folder recursively when it is missing', async () => {
    fsMock.existsSync.mockReturnValue(false);

    await runScript();

    expect(fsMock.mkdirSync).toHaveBeenCalledWith(
      expect.stringMatching(/public$/),
      { recursive: true }
    );
  });

  it('logs the output location after a successful write', async () => {
    await runScript();

    expect(console.log).toHaveBeenCalledWith(
      'Report generated successfully at:',
      expect.stringContaining(OUTPUT_FILE)
    );
  });
});
