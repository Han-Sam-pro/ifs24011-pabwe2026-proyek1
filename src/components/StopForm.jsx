import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../lib/api';
import { CATEGORIES } from '../lib/format';
import { validateStop } from '../lib/validators';
import { useToast } from './Feedback';
import Modal from './Modal';
import MapPicker from './MapPicker';
import { Field } from './ui';
import { ReactNodePropType, validateComponentProps } from '../lib/validateComponentProps';

const emptyStop = (day) => ({
  name: '',
  category: 'wisata',
  day_number: day,
  arrival_time: '',
  duration_min: 60,
  cost: 0,
  lat: '',
  lng: '',
  notes: '',
});

/** Form destinasi (tambah/ubah) dalam modal. Koordinat dapat diklik dari peta atau diisi manual. */
export default function StopForm({ tripId, dayCountTotal, defaultDay, stop, otherStops = [], onClose, onSaved }) {
  validateComponentProps(StopForm, { tripId, dayCountTotal, defaultDay, stop, otherStops, onClose, onSaved });
  const toast = useToast();
  const [v, setV] = useState(() => (stop ? {
    ...stop,
    arrival_time: stop.arrival_time || '',
    notes: stop.notes || '',
  } : emptyStop(defaultDay)));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setV((s) => ({ ...s, [key]: e.target.value }));
  const picked = v.lat !== '' && v.lng !== '' && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng))
    ? { lat: Number(v.lat), lng: Number(v.lng) }
    : null;

  const onPick = ({ lat, lng }) => setV((s) => ({
    ...s,
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
  }));

  async function submit(e) {
    e.preventDefault();
    const errs = validateStop(v);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;

    const body = {
      day_number: Number(v.day_number),
      name: v.name.trim(),
      category: v.category,
      lat: Number(v.lat),
      lng: Number(v.lng),
      arrival_time: v.arrival_time || null,
      duration_min: Number(v.duration_min),
      cost: Number(v.cost),
      notes: v.notes.trim() || null,
    };

    setBusy(true);
    try {
      if (stop) await api.put(`/trips/${tripId}/stops/${stop.id}`, body);
      else await api.post(`/trips/${tripId}/stops`, body);
      toast.success(stop ? 'Destinasi diperbarui' : 'Destinasi ditambahkan');
      onSaved();
    } catch (err) {
      if (err.details && typeof err.details === 'object') setErrors((prev) => ({ ...prev, ...err.details }));
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const dayOptions = Array.from({ length: dayCountTotal }, (_, i) => i + 1);

  return (
    <Modal title={stop ? 'Ubah destinasi' : 'Tambah destinasi'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="stop-form" id="form-stop">
        <div className="stop-form-grid">
          <div className="stop-form-fields">
            <Field label="Nama destinasi" error={errors.name} htmlFor="stop-name">
              <input id="stop-name" value={v.name} onChange={set('name')} placeholder="mis. Museum Batak Ambarita" />
            </Field>
            <div className="row-2">
              <Field label="Kategori" error={errors.category} htmlFor="stop-category">
                <select id="stop-category" value={v.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Hari ke-" error={errors.day_number} htmlFor="stop-day">
                <select id="stop-day" value={v.day_number} onChange={set('day_number')}>
                  {dayOptions.map((d) => <option key={d} value={d}>Hari {d}</option>)}
                </select>
              </Field>
            </div>
            <div className="row-2">
              <Field label="Jam kedatangan" error={errors.arrival_time} htmlFor="stop-time" hint="Opsional, untuk urutan waktu">
                <input id="stop-time" type="time" value={v.arrival_time} onChange={set('arrival_time')} />
              </Field>
              <Field label="Durasi (menit)" error={errors.duration_min} htmlFor="stop-duration">
                <input id="stop-duration" type="number" min="0" max="1440" inputMode="numeric" value={v.duration_min} onChange={set('duration_min')} />
              </Field>
            </div>
            <Field label="Estimasi biaya (Rp)" error={errors.cost} htmlFor="stop-cost" hint="Tiket, makan, sewa, atau penginapan">
              <input id="stop-cost" type="number" min="0" inputMode="numeric" value={v.cost} onChange={set('cost')} />
            </Field>
            <div className="row-2">
              <Field label="Latitude" error={errors.lat} htmlFor="stop-lat">
                <input id="stop-lat" type="number" step="any" value={v.lat} onChange={set('lat')} />
              </Field>
              <Field label="Longitude" error={errors.lng} htmlFor="stop-lng">
                <input id="stop-lng" type="number" step="any" value={v.lng} onChange={set('lng')} />
              </Field>
            </div>
            <Field label="Catatan" error={errors.notes} htmlFor="stop-notes">
              <textarea id="stop-notes" rows={2} value={v.notes} onChange={set('notes')} />
            </Field>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </div>
          <div className="stop-form-map">
            <p className="muted small">Klik peta untuk mengisi koordinat.</p>
            <MapPicker
              points={otherStops}
              selected={picked}
              onPick={onPick}
              height={300}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button id="btn-save-stop" type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan...' : 'Simpan destinasi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

StopForm.propTypes = {
  tripId: PropTypes.number.isRequired,
  dayCountTotal: PropTypes.number.isRequired,
  defaultDay: PropTypes.number.isRequired,
  stop: PropTypes.object,
  otherStops: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  children: ReactNodePropType,
};
