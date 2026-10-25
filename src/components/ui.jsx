import { ChevronLeft, ChevronRight, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import PropTypes from 'prop-types';
import { ReactNodePropType, validateComponentProps } from '../lib/validateComponentProps';

export function PageHeader({ title, subtitle, children }) {
  validateComponentProps(PageHeader, { title, subtitle, children });
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: ReactNodePropType,
};

export function Badge({ tone = 'muted', children }) {
  validateComponentProps(Badge, { tone, children });
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

Badge.propTypes = {
  tone: PropTypes.oneOf(['muted', 'primary', 'success', 'danger', 'warning']),
  children: ReactNodePropType.isRequired,
};

export function Spinner({ label = 'Memuat data...' }) {
  validateComponentProps(Spinner, { label });
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

Spinner.propTypes = { label: PropTypes.string };

export function EmptyState({ title, text, action }) {
  validateComponentProps(EmptyState, { title, text, action });
  return (
    <div className="empty">
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  action: ReactNodePropType,
};

export function ErrorState({ error, onRetry }) {
  validateComponentProps(ErrorState, { error, onRetry });
  return (
    <div className="error-state" role="alert">
      <TriangleAlert size={22} aria-hidden="true" />
      <p>{error?.message || 'Terjadi kesalahan saat memuat data.'}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}><RefreshCw size={16} /> Coba lagi</button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  onRetry: PropTypes.func,
};

export function Pagination({ meta, onPage }) {
  validateComponentProps(Pagination, { meta, onPage });
  if (!meta || meta.total_pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Halaman">
      <button className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        <ChevronLeft size={16} /> Sebelumnya
      </button>
      <span className="muted">Halaman {meta.page} dari {meta.total_pages}</span>
      <button className="btn btn-ghost btn-sm" disabled={meta.page >= meta.total_pages} onClick={() => onPage(meta.page + 1)}>
        Berikutnya <ChevronRight size={16} />
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  meta: PropTypes.shape({ page: PropTypes.number, total_pages: PropTypes.number }),
  onPage: PropTypes.func.isRequired,
};

export function SearchBox({ value, onChange, placeholder }) {
  validateComponentProps(SearchBox, { value, onChange, placeholder });
  return (
    <label className="search-box">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

SearchBox.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export function Field({ label, error, hint, children, htmlFor }) {
  validateComponentProps(Field, { label, error, hint, children, htmlFor });
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="field-error" id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</small>}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  children: ReactNodePropType.isRequired,
  htmlFor: PropTypes.string,
};

export function StatCard({ label, value, hint, tone = 'primary' }) {
  validateComponentProps(StatCard, { label, value, hint, tone });
  return (
    <div className={`stat stat-${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.string,
  tone: PropTypes.oneOf(['primary', 'accent', 'success', 'danger']),
};
