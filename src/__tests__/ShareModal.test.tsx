import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShareModal } from '../components/ShareModal';
import { PRESET_TRIPS } from '../data/presetTrips';
import * as shareUtils from '../utils/share';

vi.mock('../utils/share', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/share')>();
  return {
    ...actual,
    exportTripToJsonFile: vi.fn(),
    generateShareUrl: vi.fn(() => 'https://roamplan.test/share/abc'),
  };
});

const trip = PRESET_TRIPS[0];

function renderModal(overrides: Partial<Parameters<typeof ShareModal>[0]> = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    trip,
    onImportTrip: vi.fn(),
    onTriggerPrint: vi.fn(),
    ...overrides,
  };
  render(<ShareModal {...props} />);
  return props;
}

function uploadFile(content: string, name = 'trip.json') {
  const input = document.getElementById('json-upload-file') as HTMLInputElement;
  const file = new File([content], name, { type: 'application/json' });
  fireEvent.change(input, { target: { files: [file] } });
}

describe('ShareModal', () => {
  beforeEach(() => {
    vi.mocked(shareUtils.exportTripToJsonFile).mockClear();
    vi.mocked(shareUtils.generateShareUrl).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ShareModal
        isOpen={false}
        onClose={vi.fn()}
        trip={trip}
        onImportTrip={vi.fn()}
        onTriggerPrint={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the generated share URL in a read-only input', () => {
    renderModal();

    const input = document.getElementById('share-url-input') as HTMLInputElement;
    expect(input).toHaveValue('https://roamplan.test/share/abc');
    expect(input).toHaveAttribute('readonly');
    expect(shareUtils.generateShareUrl).toHaveBeenCalledWith(trip);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('copies the link to the clipboard and shows the "Tersalin!" confirmation', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /salin tautan itinerary ke clipboard/i }));

    await waitFor(() => expect(screen.getByText('Tersalin!')).toBeInTheDocument());
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://roamplan.test/share/abc');
  });

  it('falls back to selecting the input and execCommand when clipboard write fails', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('denied'));
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /salin tautan itinerary ke clipboard/i }));

    await waitFor(() => expect(screen.getByText('Tersalin!')).toBeInTheDocument());
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('resets the copied state after the timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /salin tautan itinerary ke clipboard/i }));
    await waitFor(() => expect(screen.getByText('Tersalin!')).toBeInTheDocument());

    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByText('Salin Tautan')).toBeInTheDocument();
  });

  it('closes the modal and triggers print after a short delay from the print action', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { onClose, onTriggerPrint } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /buka pratinjau cetak/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onTriggerPrint).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onTriggerPrint).toHaveBeenCalledTimes(1);
  });

  it('exports the trip as a JSON file from the export action', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /unduh salinan data perjalanan/i }));

    expect(shareUtils.exportTripToJsonFile).toHaveBeenCalledWith(trip);
  });

  it('imports a valid RoamPlan JSON file and closes the modal', async () => {
    const { onImportTrip, onClose } = renderModal();
    const imported = { ...trip, title: 'Imported Trip' };

    uploadFile(JSON.stringify(imported));

    await waitFor(() => expect(onImportTrip).toHaveBeenCalledTimes(1));
    expect(onImportTrip).toHaveBeenCalledWith(imported);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a format error when the JSON has no days array', async () => {
    const { onImportTrip, onClose } = renderModal();

    uploadFile(JSON.stringify({ title: 'Bukan itinerary' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Format berkas tidak valid untuk RoamPlan.'
    );
    expect(onImportTrip).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a read error when the file content is not valid JSON', async () => {
    const { onImportTrip } = renderModal();

    uploadFile('{ ini bukan json');

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal membaca berkas JSON.');
    expect(onImportTrip).not.toHaveBeenCalled();
  });

  it('clears a previous import error when a new file is selected', async () => {
    renderModal();

    uploadFile('{ rusak');
    await screen.findByRole('alert');

    uploadFile('{}');
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('ignores a change event that contains no file', () => {
    const { onImportTrip, onClose } = renderModal();
    const input = document.getElementById('json-upload-file') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(onImportTrip).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('closes via the header close button and the footer "Tutup" button', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByLabelText(/tutup jendela bagikan itinerary/i));
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
