import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync, useDebounce } from '../lib/hooks';
import { formatDate } from '../lib/format';
import { EmptyState, ErrorState, Pagination, PageHeader, SearchBox, Spinner } from '../components/ui';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

/** Daftar seluruh pengguna RoamPlan (hanya nama, username, bio, dan tanggal bergabung). */
export default function Users() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const query = useDebounce(search);
  const { data: users, meta, loading, error, reload } = useAsync(
    () => api.get('/users', { q: query, page, limit: 9 }),
    [query, page],
  );

  const onSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="page">
      <PageHeader title="Pengguna" subtitle={meta ? `${meta.total} pengguna terdaftar` : 'Semua pengguna RoamPlan'} />

      <div className="toolbar">
        <SearchBox value={search} onChange={onSearch} placeholder="Cari nama atau username" />
      </div>

      {loading && !users && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {users && users.length === 0 && (
        <EmptyState title="Pengguna tidak ditemukan" text="Coba kata kunci lain." />
      )}

      {users && users.length > 0 && (
        <>
          <ul className="user-grid" aria-live="polite">
            {users.map((u) => (
              <li key={u.id} className="card user-card">
                <span className="avatar" aria-hidden="true">{initials(u.name)}</span>
                <div>
                  <p className="list-title">{u.name}</p>
                  <p className="muted small">@{u.username}</p>
                  {u.bio && <p className="small user-bio">{u.bio}</p>}
                  <p className="muted small"><CalendarDays size={13} aria-hidden="true" /> Bergabung {formatDate(u.created_at.slice(0, 10))}</p>
                </div>
              </li>
            ))}
          </ul>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
