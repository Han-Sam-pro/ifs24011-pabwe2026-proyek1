const idr = new Intl.NumberFormat('id-ID');

/** Format Rupiah, mis. "Rp 1.250.000". */
export const rupiah = (value) => `Rp ${idr.format(Math.round(Number(value) || 0))}`;

// Tanggal berbentuk YYYY-MM-DD diperlakukan sebagai tanggal kalender (UTC) agar tidak bergeser zona waktu.
const parseDay = (value) => new Date(`${value.slice(0, 10)}T00:00:00Z`);

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(parseDay(value));
}

export function formatLongDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(parseDay(value));
}

/** Tanggal hari ini (WIB) dalam format YYYY-MM-DD. */
export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
}

export function addDays(value, days) {
  const date = parseDay(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Selisih hari (b - a). */
export function diffDays(a, b) {
  return Math.round((parseDay(b) - parseDay(a)) / 86400000);
}

/** Jumlah hari inklusif antara dua tanggal. */
export const dayCount = (start, end) => diffDays(start, end) + 1;

export function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} menit`;
  return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
}

export const CATEGORIES = [
  { value: 'wisata', label: 'Wisata' },
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'transportasi', label: 'Transportasi' },
  { value: 'penginapan', label: 'Penginapan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const categoryLabel = (value) => CATEGORIES.find((c) => c.value === value)?.label || value;
