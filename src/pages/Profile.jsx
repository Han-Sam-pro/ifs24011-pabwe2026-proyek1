import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { formatDate } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Feedback';
import { ErrorState, Field, PageHeader, Spinner, StatCard } from '../components/ui';
import { validatePasswordChange, validateProfile } from '../lib/validators';

const EMPTY_PASSWORD = { current_password: '', new_password: '', confirm_password: '' };

/** Profil pengguna: lihat dan ubah data diri, serta ganti kata sandi. */
export default function Profile() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const { data: profile, loading, error, reload } = useAsync(() => api.get('/profile'), []);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState(EMPTY_PASSWORD);
  const [pwErrors, setPwErrors] = useState({});
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone || '', bio: profile.bio || '' });
    }
  }, [profile]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if ((loading && !profile) || !form) return <Spinner />;

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const setPassword = (k) => (e) => setPw((s) => ({ ...s, [k]: e.target.value }));

  async function saveProfile(e) {
    e.preventDefault();
    const errs = validateProfile(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await api.put('/profile', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
      });
      updateUser({ name: res.data.name, email: res.data.email });
      toast.success('Profil disimpan');
      reload();
    } catch (err) {
      if (err.details && typeof err.details === 'object') setErrors((prev) => ({ ...prev, ...err.details }));
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    const errs = validatePasswordChange(pw);
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPwBusy(true);
    try {
      await api.put('/profile/password', {
        current_password: pw.current_password,
        new_password: pw.new_password,
      });
      setPw(EMPTY_PASSWORD);
      toast.success('Kata sandi diperbarui');
    } catch (err) {
      if (err.details && typeof err.details === 'object') setPwErrors((prev) => ({ ...prev, ...err.details }));
      toast.error(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Profil" subtitle={`@${profile.username} · bergabung ${formatDate(profile.created_at.slice(0, 10))}`} />

      <section className="stat-grid" aria-label="Ringkasan profil">
        <StatCard label="Rencana perjalanan" value={profile.trip_count} hint="Yang kamu buat" />
      </section>

      <div className="detail-grid">
        <form onSubmit={saveProfile} noValidate className="card form-stack" id="form-profile">
          <h2>Data diri</h2>
          <Field label="Nama lengkap" error={errors.name} htmlFor="profile-name">
            <input id="profile-name" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Email" error={errors.email} htmlFor="profile-email">
            <input id="profile-email" type="email" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Nomor telepon" error={errors.phone} htmlFor="profile-phone" hint="Opsional">
            <input id="profile-phone" inputMode="tel" value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Bio" error={errors.bio} htmlFor="profile-bio" hint="Ceritakan gaya perjalananmu (opsional)">
            <textarea id="profile-bio" rows={3} value={form.bio} onChange={set('bio')} />
          </Field>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan profil'}</button>
          </div>
        </form>

        <form onSubmit={savePassword} noValidate className="card form-stack" id="form-password">
          <h2>Ganti kata sandi</h2>
          <Field label="Kata sandi saat ini" error={pwErrors.current_password} htmlFor="current_password">
            <input id="current_password" type="password" autoComplete="current-password" value={pw.current_password} onChange={setPassword('current_password')} />
          </Field>
          <Field label="Kata sandi baru" error={pwErrors.new_password} htmlFor="new_password" hint="Minimal 8 karakter, berisi huruf dan angka">
            <input id="new_password" type="password" autoComplete="new-password" value={pw.new_password} onChange={setPassword('new_password')} />
          </Field>
          <Field label="Ulangi kata sandi baru" error={pwErrors.confirm_password} htmlFor="confirm_password">
            <input id="confirm_password" type="password" autoComplete="new-password" value={pw.confirm_password} onChange={setPassword('confirm_password')} />
          </Field>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={pwBusy}>{pwBusy ? 'Memproses...' : 'Ubah kata sandi'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
