import { Compass } from 'lucide-react';
import PropTypes from 'prop-types';
import { ReactNodePropType, validateComponentProps } from '../lib/validateComponentProps';

export default function AuthShell({ title, subtitle, children, footer }) {
  validateComponentProps(AuthShell, { title, subtitle, children, footer });
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true"><Compass size={26} /></span>
          <p className="auth-brand-name">RoamPlan</p>
        </div>
        <p className="auth-tagline">Susun perjalanan harimu: destinasi di peta, urutan kunjungan, dan estimasi biaya dalam satu tempat.</p>
        <ul className="auth-points">
          <li>Itinerary per hari</li>
          <li>Urutan berdasarkan waktu dan jarak</li>
          <li>Estimasi biaya otomatis</li>
        </ul>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}

AuthShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: ReactNodePropType.isRequired,
  footer: ReactNodePropType,
};
