import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Field } from '../components/ui';
import { validateRegister } from '../lib/validators';

const EMPTY = { name: '', username: '', email: '', password: '', confirm_password: '' };

/** Halaman khusus daftar: membuat akun baru. Masuk dilakukan di halaman terpisah. */
export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    const errs = validateRegister(v);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await register({
        name: v.name.trim(),
        username: v.username.trim(),
        email: v.email.trim(),
        password: v.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err.details && typeof err.details === 'object') setErrors((prev) => ({ ...prev, ...err.details }));
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Daftar"
      subtitle="Buat akun untuk mulai menyusun perjalanan."
      footer={<>Sudah punya akun? <Link className="link" to="/auth/login">Masuk</Link></>}
    >
      <form onSubmit={submit} noValidate className="auth-form" id="form-register">
        <Field label="Nama lengkap" error={errors.name} htmlFor="name">
          <input id="name" autoComplete="name" value={v.name} onChange={set('name')} />
        </Field>
        <Field label="Username" error={errors.username} htmlFor="username" hint="Huruf, angka, atau garis bawah">
          <input id="username" autoComplete="username" autoCapitalize="none" value={v.username} onChange={set('username')} />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <input id="email" type="email" autoComplete="email" value={v.email} onChange={set('email')} />
        </Field>
        <Field label="Kata sandi" error={errors.password} htmlFor="password" hint="Minimal 8 karakter, berisi huruf dan angka">
          <input id="password" type="password" autoComplete="new-password" value={v.password} onChange={set('password')} />
        </Field>
        <Field label="Ulangi kata sandi" error={errors.confirm_password} htmlFor="confirm_password">
          <input id="confirm_password" type="password" autoComplete="new-password" value={v.confirm_password} onChange={set('confirm_password')} />
        </Field>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button id="btn-submit" type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </AuthShell>
  );
}
