import { Link } from 'react-router-dom';
import { CalendarRange, Plus } from 'lucide-react';
import { useAsync } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, rupiah } from '../lib/format';
import { EmptyState, ErrorState, PageHeader, Spinner, StatCard, Badge } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([api.get('/trips'), api.get('/users', { limit: 1 })])
      .then(([trips, users]) => ({ data: { trips: trips.data, userTotal: users.meta.total }, meta: null })),
    [],
  );

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { trips, userTotal } = data;
  const totalStops = trips.reduce((sum, t) => sum + t.stop_count, 0);
  const totalCost = trips.reduce((sum, t) => sum + t.total_cost, 0);
  const totalDistance = trips.reduce((sum, t) => sum + t.distance_km, 0);
  const recent = trips.slice(0, 3);

  return (
    <div className="page">
      <PageHeader title={`Halo, ${user?.name?.split(' ')[0] || 'pelancong'}`} subtitle="Ringkasan rencana perjalananmu.">
        <Link className="btn btn-primary" to="/rencana/baru"><Plus size={18} /> Rencana baru</Link>
      </PageHeader>

      <section className="stat-grid" aria-label="Ringkasan">
        <StatCard label="Rencana perjalanan" value={trips.length} hint="Milik kamu" />
        <StatCard label="Destinasi" value={totalStops} hint={`${totalDistance.toLocaleString('id-ID', { maximumFractionDigits: 1 })} km total rute`} tone="accent" />
        <StatCard label="Estimasi biaya" value={rupiah(totalCost)} hint="Aktivitas + transportasi" tone="success" />
        <StatCard label="Pengguna RoamPlan" value={userTotal} hint="Seluruh akun terdaftar" />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Rencana terbaru</h2>
          <Link className="link" to="/rencana">Lihat semua</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="Belum ada rencana"
            text="Buat rencana pertama untuk menambahkan destinasi dan menghitung estimasi biaya."
            action={<Link className="btn btn-primary" to="/rencana/baru"><CalendarRange size={18} /> Buat rencana</Link>}
          />
        ) : (
          <ul className="list">
            {recent.map((t) => (
              <li key={t.id}>
                <Link className="list-row" to={`/rencana/${t.id}`}>
                  <div>
                    <p className="list-title">{t.title}</p>
                    <p className="muted small">{t.destination} &middot; {formatDate(t.start_date)} - {formatDate(t.end_date)}</p>
                  </div>
                  {t.over_budget ? <Badge tone="danger">Melebihi anggaran</Badge> : <Badge tone="success">{rupiah(t.total_cost)}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
