import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAsync, useDebounce } from '../lib/hooks';
import { api } from '../lib/api';
import { useConfirm, useToast } from '../components/Feedback';
import { formatDate, rupiah } from '../lib/format';
import { Badge, EmptyState, ErrorState, PageHeader, SearchBox, Spinner } from '../components/ui';

export default function Trips() {
  const [search, setSearch] = useState('');
  const query = useDebounce(search);
  const toast = useToast();
  const confirm = useConfirm();
  const { data: trips, loading, error, reload } = useAsync(
    () => api.get('/trips', { q: query }),
    [query],
  );

  async function remove(trip) {
    const ok = await confirm({
      title: 'Hapus rencana?',
      message: `"${trip.title}" beserta seluruh destinasinya akan dihapus permanen.`,
      tone: 'danger',
      confirmText: 'Hapus',
    });
    if (!ok) return;
    try {
      await api.del(`/trips/${trip.id}`);
      toast.success('Rencana dihapus');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Rencana Perjalanan" subtitle="Semua itinerary yang kamu susun.">
        <Link className="btn btn-primary" to="/rencana/baru"><Plus size={18} /> Rencana baru</Link>
      </PageHeader>

      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari judul atau destinasi" />
      </div>

      {loading && !trips && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {trips && trips.length === 0 && (
        <EmptyState
          title={query ? 'Tidak ada rencana yang cocok' : 'Belum ada rencana'}
          text={query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat rencana perjalanan baru.'}
          action={!query && <Link className="btn btn-primary" to="/rencana/baru">Buat rencana</Link>}
        />
      )}

      {trips && trips.length > 0 && (
        <ul className="trip-grid" aria-live="polite">
          {trips.map((t) => (
            <li key={t.id} className="card trip-card">
              <div className="trip-card-head">
                <h2><Link to={`/rencana/${t.id}`}>{t.title}</Link></h2>
                {t.over_budget ? <Badge tone="danger">Over budget</Badge> : <Badge tone="primary">{t.day_count} hari</Badge>}
              </div>
              <p className="muted small"><MapPin size={14} aria-hidden="true" /> {t.destination}</p>
              <p className="muted small"><CalendarRange size={14} aria-hidden="true" /> {formatDate(t.start_date)} - {formatDate(t.end_date)}</p>
              <dl className="mini-stats">
                <div><dt>Destinasi</dt><dd>{t.stop_count}</dd></div>
                <div><dt>Jarak</dt><dd>{t.distance_km.toLocaleString('id-ID', { maximumFractionDigits: 1 })} km</dd></div>
                <div><dt>Estimasi</dt><dd>{rupiah(t.total_cost)}</dd></div>
              </dl>
              <div className="card-actions">
                <Link className="btn btn-ghost btn-sm" to={`/rencana/${t.id}/ubah`}><Pencil size={16} /> Ubah</Link>
                <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => remove(t)}><Trash2 size={16} /> Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
