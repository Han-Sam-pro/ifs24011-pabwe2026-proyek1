import { dayCount } from './format';

export const TRIP_MAX_DAYS = 30;
export const TRIP_CATEGORIES = ['wisata', 'kuliner', 'transportasi', 'penginapan', 'lainnya'];

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d[\d\s-]{6,18}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const s = (v) => (v === undefined || v === null ? '' : String(v).trim());
const isInt = (v) => typeof v === 'number' ? Number.isInteger(v) : /^\d+$/.test(s(v));

export function passwordError(password) {
  if (password.length < 8 || password.length > 72) return 'Kata sandi harus 8-72 karakter';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Kata sandi harus mengandung huruf dan angka';
  return '';
}

export function validateLogin(v) {
  const e = {};
  if (!s(v.username)) e.username = 'Username wajib diisi';
  if (!v.password) e.password = 'Kata sandi wajib diisi';
  return e;
}

export function validateRegister(v) {
  const e = {};
  if (s(v.name).length < 3) e.name = 'Nama minimal 3 karakter';
  if (!USERNAME_RE.test(s(v.username))) e.username = 'Username 3-30 karakter: huruf, angka, atau garis bawah';
  if (!EMAIL_RE.test(s(v.email))) e.email = 'Format email tidak valid';
  const pw = passwordError(v.password || '');
  if (pw) e.password = pw;
  if (v.confirm_password !== v.password) e.confirm_password = 'Konfirmasi kata sandi tidak sama';
  return e;
}

export function validateProfile(v) {
  const e = {};
  if (s(v.name).length < 3) e.name = 'Nama minimal 3 karakter';
  if (!EMAIL_RE.test(s(v.email))) e.email = 'Format email tidak valid';
  if (s(v.phone) && !PHONE_RE.test(s(v.phone))) e.phone = 'Nomor telepon tidak valid';
  if (s(v.bio).length > 300) e.bio = 'Bio maksimal 300 karakter';
  return e;
}

export function validatePasswordChange(v) {
  const e = {};
  if (!v.current_password) e.current_password = 'Kata sandi saat ini wajib diisi';
  const pw = passwordError(v.new_password || '');
  if (pw) e.new_password = pw;
  else if (v.new_password === v.current_password) e.new_password = 'Kata sandi baru harus berbeda';
  if (v.new_password !== v.confirm_password) e.confirm_password = 'Konfirmasi kata sandi tidak sama';
  return e;
}

export function validateTrip(v) {
  const e = {};
  if (s(v.title).length < 3) e.title = 'Judul minimal 3 karakter';
  if (s(v.destination).length < 2) e.destination = 'Destinasi minimal 2 karakter';
  const validStart = DATE_RE.test(s(v.start_date));
  const validEnd = DATE_RE.test(s(v.end_date));
  if (!validStart) e.start_date = 'Tanggal mulai wajib diisi';
  if (!validEnd) {
    e.end_date = 'Tanggal selesai wajib diisi';
  } else if (validStart) {
    if (v.end_date < v.start_date) e.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    else if (dayCount(v.start_date, v.end_date) > TRIP_MAX_DAYS) e.end_date = `Durasi maksimal ${TRIP_MAX_DAYS} hari`;
  }
  if (!isInt(v.budget) || Number(v.budget) > 1e9) e.budget = 'Anggaran harus bilangan bulat 0 - 1.000.000.000';
  return e;
}

export function validateStop(v) {
  const e = {};
  const lat = Number(v.lat);
  const lng = Number(v.lng);
  if (s(v.name).length < 2) e.name = 'Nama destinasi minimal 2 karakter';
  if (!TRIP_CATEGORIES.includes(v.category)) e.category = 'Pilih kategori';
  if (s(v.lat) === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) e.lat = 'Latitude harus -90 sampai 90';
  if (s(v.lng) === '' || !Number.isFinite(lng) || lng < -180 || lng > 180) e.lng = 'Longitude harus -180 sampai 180';
  if (s(v.arrival_time) && !TIME_RE.test(s(v.arrival_time))) e.arrival_time = 'Format jam harus HH:MM';
  if (!isInt(v.duration_min) || Number(v.duration_min) > 1440) e.duration_min = 'Durasi 0-1440 menit';
  if (!isInt(v.cost) || Number(v.cost) > 1e9) e.cost = 'Biaya harus bilangan bulat 0 - 1.000.000.000';
  if (s(v.notes).length > 500) e.notes = 'Catatan maksimal 500 karakter';
  return e;
}
