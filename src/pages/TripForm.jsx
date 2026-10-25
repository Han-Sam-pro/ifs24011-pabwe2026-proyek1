import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { addDays, todayIso } from '../lib/format';
import { validateTrip, TRIP_MAX_DAYS } from '../lib/validators';
import { useToast } from '../components/Feedback';
import { ErrorState, Field, PageHeader, Spinner } from '../components/ui';

const fromTrip = (t) => ({
  title: t.title,
  destination: t.destination,
  start_date: t.start_date,
  end_date: t.end_date,
  budget: String(t.budget),
});

/** Formulir rencana: buat baru (/rencana/baru) atau ubah (/rencana/:id/ubah). */
export default function TripForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const today = todayIso();

  const { data: trip, loading, error, reload } = useAsync(
    () => (isEdit ? api.get(`/trips/${id}`) : Promise.resolve({ data: null, meta: null })),
    [id],
  );

  const [v, setV] = useState({
    title: '',
    destination: '',
    start_date: today,
    end_date: addDays(today, 1),
    budget: '1000000',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (trip) setV(fromTrip(trip));
  }, [trip]);

  if (isEdit && loading && !trip) return <Spinner />;
  if (isEdit && error) return <ErrorState error={error} onRetry={reload} />;

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const errs = validateTrip(v);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;

    const body = {
      title: v.title.trim(),
      destination: v.destination.trim(),
      start_date: v.start_date,
      end_date: v.end_date,
      budget: Number(v.budget || 0),
    };

    setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/trips/${id}`, body);
        toast.success('Rencana diperbarui');
        navigate(`/rencana/${id}`);
      } else {
        const res = await api.post('/trips', body);
        toast.success('Rencana dibuat. Tambahkan destinasi sekarang.');
        navigate(`/rencana/${res.data.id}`);
      }
    } catch (err) {
      if (err.details && typeof err.details === 'object') setErrors((prev) => ({ ...prev, ...err.details }));
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow">
      <PageHeader title={isEdit ? 'Ubah rencana' : 'Rencana baru'} subtitle={`Durasi maksimal ${TRIP_MAX_DAYS} hari.`}>
        <Link className="btn btn-ghost" to={isEdit ? `/rencana/${id}` : '/rencana'}>Batal</Link>
      </PageHeader>

      <form onSubmit={submit} noValidate className="card form-stack" id="form-trip">
        <Field label="Judul rencana" error={errors.title} htmlFor="title">
          <input id="title" value={v.title} onChange={set('title')} placeholder="mis. Liburan Samosir akhir tahun" />
        </Field>
        <Field label="Destinasi utama" error={errors.destination} htmlFor="destination">
          <input id="destination" value={v.destination} onChange={set('destination')} placeholder="mis. Danau Toba, Samosir" />
        </Field>
        <div className="row-2">
          <Field label="Tanggal mulai" error={errors.start_date} htmlFor="start_date">
            <input id="start_date" type="date" value={v.start_date} onChange={set('start_date')} />
          </Field>
          <Field label="Tanggal selesai" error={errors.end_date} htmlFor="end_date">
            <input id="end_date" type="date" value={v.end_date} min={v.start_date || undefined} onChange={set('end_date')} />
          </Field>
        </div>
        <Field
          label="Anggaran (Rp)"
          error={errors.budget}
          htmlFor="budget"
          hint="Isi 0 bila tidak ingin membatasi anggaran"
        >
          <input id="budget" type="number" min="0" inputMode="numeric" value={v.budget} onChange={set('budget')} />
        </Field>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="form-actions">
          <button id="btn-save-trip" type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Buat rencana'}
          </button>
        </div>
      </form>
    </div>
  );
}
