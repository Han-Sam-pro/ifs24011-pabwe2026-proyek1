import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="page">
      <EmptyState
        title="Halaman tidak ditemukan"
        text="Alamat yang kamu tuju tidak tersedia."
        action={<Link className="btn btn-primary" to="/">Kembali ke beranda</Link>}
      />
    </div>
  );
}
