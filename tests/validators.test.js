import { describe, it, expect } from 'vitest';
import {
  passwordError, validateLogin, validatePasswordChange, validateRegister, validateStop, validateTrip,
} from '../src/lib/validators';
import { addDays, categoryLabel, dayCount, diffDays, formatDuration, rupiah } from '../src/lib/format';

const validTrip = {
  title: 'Liburan Samosir',
  destination: 'Danau Toba',
  start_date: '2026-11-10',
  end_date: '2026-11-12',
  budget: '1000000',
};

const validStop = {
  name: 'Museum Batak Ambarita',
  category: 'wisata',
  lat: '2.5667',
  lng: '98.8817',
  arrival_time: '09:30',
  duration_min: '60',
  cost: '25000',
  notes: '',
};

describe('validateTrip', () => {
  it('menerima rencana yang valid', () => {
    expect(validateTrip(validTrip)).toEqual({});
  });

  it('menolak tanggal selesai sebelum tanggal mulai', () => {
    expect(validateTrip({ ...validTrip, end_date: '2026-11-09' }).end_date).toMatch(/sebelum/);
  });

  it('menolak durasi lebih dari 30 hari', () => {
    expect(validateTrip({ ...validTrip, end_date: '2026-12-10' }).end_date).toMatch(/30 hari/);
  });

  it('menolak anggaran negatif atau bukan angka', () => {
    expect(validateTrip({ ...validTrip, budget: '-5' }).budget).toBeDefined();
    expect(validateTrip({ ...validTrip, budget: 'abc' }).budget).toBeDefined();
  });

  it('menolak judul terlalu pendek dan tanggal kosong', () => {
    const errors = validateTrip({ ...validTrip, title: 'ab', start_date: '' });
    expect(errors.title).toBeDefined();
    expect(errors.start_date).toBeDefined();
  });
});

describe('validateStop', () => {
  it('menerima destinasi yang valid', () => {
    expect(validateStop(validStop)).toEqual({});
  });

  it('menolak format jam yang salah', () => {
    expect(validateStop({ ...validStop, arrival_time: '9.30' }).arrival_time).toBeDefined();
  });

  it('menolak koordinat di luar rentang atau kosong', () => {
    expect(validateStop({ ...validStop, lat: '91' }).lat).toBeDefined();
    expect(validateStop({ ...validStop, lng: '' }).lng).toBeDefined();
  });

  it('menolak kategori yang tidak dikenal', () => {
    expect(validateStop({ ...validStop, category: 'tidak-ada' }).category).toBeDefined();
  });

  it('jam kedatangan boleh kosong', () => {
    expect(validateStop({ ...validStop, arrival_time: '' })).toEqual({});
  });
});

describe('validasi akun', () => {
  it('login memerlukan username dan kata sandi', () => {
    expect(validateLogin({ username: '', password: '' })).toEqual({
      username: 'Username wajib diisi',
      password: 'Kata sandi wajib diisi',
    });
  });

  it('kata sandi harus 8 karakter dan memuat huruf serta angka', () => {
    expect(passwordError('abc')).toMatch(/8-72/);
    expect(passwordError('12345678')).toMatch(/huruf dan angka/);
    expect(passwordError('abcdefg1')).toBe('');
  });

  it('username hanya boleh huruf, angka, dan garis bawah', () => {
    const base = { name: 'Alice Samosir', email: 'alice@example.com', password: 'rahasia123', confirm_password: 'rahasia123' };
    expect(validateRegister({ ...base, username: 'alice-01' }).username).toBeDefined();
    expect(validateRegister({ ...base, username: 'alice_01' })).toEqual({});
  });

  it('ganti kata sandi menolak kata sandi baru yang sama dengan yang lama', () => {
    const errors = validatePasswordChange({
      current_password: 'lama12345', new_password: 'lama12345', confirm_password: 'lama12345',
    });
    expect(errors.new_password).toMatch(/berbeda/);
  });
});

describe('format', () => {
  it('rupiah memakai pemisah ribuan', () => {
    expect(rupiah(1250000)).toBe('Rp 1.250.000');
    expect(rupiah(undefined)).toBe('Rp 0');
  });

  it('formatDuration menampilkan jam dan menit', () => {
    expect(formatDuration(90)).toBe('1 jam 30 menit');
    expect(formatDuration(45)).toBe('45 menit');
    expect(formatDuration(120)).toBe('2 jam');
  });

  it('addDays, diffDays, dan dayCount bekerja lintas bulan', () => {
    expect(addDays('2026-10-30', 2)).toBe('2026-11-01');
    expect(diffDays('2026-11-10', '2026-11-12')).toBe(2);
    expect(dayCount('2026-11-10', '2026-11-12')).toBe(3);
  });

  it('categoryLabel menerjemahkan kategori', () => {
    expect(categoryLabel('kuliner')).toBe('Kuliner');
    expect(categoryLabel('lainnya-baru')).toBe('lainnya-baru');
  });
});
