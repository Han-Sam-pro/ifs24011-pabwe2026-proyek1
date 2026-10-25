import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownUp, Clock, MapPin, Navigation, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { categoryLabel, formatDate, formatDuration, formatLongDate, rupiah } from '../lib/format';
import { formatKm, haversineKm } from '../lib/geo';
import { useConfirm, useToast } from '../components/Feedback';
import MapPicker from '../components/MapPicker';
import StopForm from '../components/StopForm';
import { Badge, EmptyState, ErrorState, PageHeader, Spinner, StatCard } from '../components/ui';

/** Itinerary per hari: destinasi berurutan, peta, dan rincian estimasi biaya. */
export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: trip, loading, error, reload } = useAsync(() => api.get(`/trips/${id}`), [id]);
  const [dayNo, setDayNo] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | objek destinasi
  const [busy, setBusy] = useState(false);

  if (loading && !trip) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const day = trip.days.find((d) => d.day_number === dayNo) || trip.days[0];
  const costs = trip.costs;
  const segments = day.stops.map((stop, index) => (index === 0 ? null : haversineKm(day.stops[index - 1], stop)));
  const points = day.stops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name }));

  async function reorder(mode) {
    setBusy(true);
    try {
      await api.post(`/trips/${trip.id}/days/${day.day_number}/reorder`, { mode });
      toast.success(mode === 'time' ? 'Diurutkan berdasarkan jam kedatangan' : 'Diurutkan berdasarkan jarak terdekat');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeStop(stop) {
    const ok = await confirm({
      title: 'Hapus destinasi?',
      message: `"${stop.name}" akan dihapus dari hari ke-${stop.day_number}.`,
      tone: 'danger',
      confirmText: 'Hapus',
    });
    if (!ok) return;
    try {
      await api.del(`/trips/${trip.id}/stops/${stop.id}`);
      toast.success('Destinasi dihapus');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeTrip() {
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
      navigate('/rencana', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title={trip.title} subtitle={`${trip.destination} · ${formatDate(trip.start_date)} - ${formatDate(trip.end_date)} · ${trip.day_count} hari`}>
        <Link className="btn btn-ghost" to={`/rencana/${trip.id}/ubah`}><Pencil size={16} /> Ubah</Link>
        <button className="btn btn-ghost btn-danger-text" onClick={removeTrip}><Trash2 size={16} /> Hapus</button>
      </PageHeader>

      <section className="stat-grid" aria-label="Ringkasan biaya">
        <StatCard label="Estimasi total" value={rupiah(costs.total_cost)} hint="Aktivitas + transportasi" tone="success" />
        <StatCard label="Biaya aktivitas" value={rupiah(costs.activity_cost)} hint="Jumlah biaya tiap destinasi" />
        <StatCard label="Biaya transportasi" value={rupiah(costs.transport_cost)} hint={`Berdasarkan ${costs.distance_km.toLocaleString('id-ID')} km rute`} tone="accent" />
        <StatCard
          label={costs.budget > 0 ? (costs.over_budget ? 'Lebih dari anggaran' : 'Sisa anggaran') : 'Anggaran'}
          value={costs.budget > 0 ? rupiah(Math.abs(costs.remaining)) : 'Tidak dibatasi'}
          hint={costs.budget > 0 ? `Anggaran ${rupiah(costs.budget)}` : 'Atur di menu ubah rencana'}
          tone={costs.over_budget ? 'danger' : 'primary'}
        />
      </section>

      <nav className="day-tabs" aria-label="Pilih hari">
        {trip.days.map((d) => (
          <button
            key={d.day_number}
            type="button"
            className={`day-tab ${d.day_number === day.day_number ? 'active' : ''}`}
            aria-pressed={d.day_number === day.day_number}
            onClick={() => setDayNo(d.day_number)}
          >
            <span className="day-tab-no">Hari {d.day_number}</span>
            <span className="day-tab-date">{formatDate(d.date)} · {d.stop_count} destinasi</span>
          </button>
        ))}
      </nav>

      <div className="detail-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>{formatLongDate(day.date)}</h2>
              <p className="muted small">
                {day.stop_count} destinasi · rute {formatKm(day.distance_km)} · estimasi {rupiah(day.total_cost)}
              </p>
            </div>
          </div>

          <div className="toolbar-row">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><Plus size={16} /> Tambah destinasi</button>
            <button className="btn btn-ghost btn-sm" disabled={busy || day.stops.length < 2} onClick={() => reorder('time')}>
              <Clock size={16} /> Urutkan waktu
            </button>
            <button className="btn btn-ghost btn-sm" disabled={busy || day.stops.length < 2} onClick={() => reorder('distance')}>
              <Navigation size={16} /> Urutkan jarak
            </button>
          </div>

          {day.stops.length === 0 ? (
            <EmptyState title="Belum ada destinasi" text="Tambahkan destinasi untuk hari ini. Klik peta atau isi koordinat secara manual." />
          ) : (
            <ol className="stop-list" aria-label={`Destinasi hari ${day.day_number}`}>
              {day.stops.map((s, index) => (
                <li key={s.id} className="stop">
                  <span className="stop-no" aria-hidden="true">{index + 1}</span>
                  <div className="stop-body">
                    <p className="stop-name">
                      {s.name} <Badge tone="muted">{categoryLabel(s.category)}</Badge>
                    </p>
                    <p className="muted small">
                      <Clock size={13} aria-hidden="true" /> {s.arrival_time || 'Tanpa jam'} · {formatDuration(s.duration_min)} · {rupiah(s.cost)}
                    </p>
                    {segments[index] !== null && (
                      <p className="small seg"><ArrowDownUp size={13} aria-hidden="true" /> {formatKm(segments[index])} dari destinasi sebelumnya</p>
                    )}
                    {s.notes && <p className="small muted">{s.notes}</p>}
                  </div>
                  <div className="stop-actions">
                    <button className="icon-btn" aria-label={`Ubah ${s.name}`} onClick={() => setEditing(s)}><Pencil size={16} /></button>
                    <button className="icon-btn" aria-label={`Hapus ${s.name}`} onClick={() => removeStop(s)}><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="muted small hint-line"><MapPin size={13} aria-hidden="true" /> Urutan waktu: destinasi ber-jam lebih dulu. Urutan jarak: tetangga terdekat dari destinasi pertama.</p>
        </section>

        <section className="card map-card">
          <MapPicker points={points} route height={420} />
        </section>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>Estimasi per hari</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Hari</th><th>Destinasi</th><th>Jarak</th><th>Aktivitas</th><th>Transportasi</th><th>Total</th></tr>
              </thead>
              <tbody>
                {trip.days.map((d) => (
                  <tr key={d.day_number}>
                    <td>{d.day_number}</td>
                    <td>{d.stop_count}</td>
                    <td>{formatKm(d.distance_km)}</td>
                    <td>{rupiah(d.activity_cost)}</td>
                    <td>{rupiah(d.transport_cost)}</td>
                    <td><strong>{rupiah(d.total_cost)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card">
          <h2>Biaya per kategori</h2>
          {Object.keys(costs.by_category).length === 0 ? (
            <p className="muted">Belum ada biaya destinasi.</p>
          ) : (
            <ul className="cost-list">
              {Object.entries(costs.by_category).map(([category, amount]) => (
                <li key={category}><span>{categoryLabel(category)}</span><strong>{rupiah(amount)}</strong></li>
              ))}
            </ul>
          )}
          <p className="muted small">Estimasi transportasi dihitung dari jarak Haversine antar destinasi berurutan dikalikan tarif per km di server.</p>
        </section>
      </div>

      {editing !== null && (
        <StopForm
          tripId={trip.id}
          dayCountTotal={trip.day_count}
          defaultDay={day.day_number}
          stop={editing === 'new' ? undefined : editing}
          otherStops={points}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
    </div>
  );
}
