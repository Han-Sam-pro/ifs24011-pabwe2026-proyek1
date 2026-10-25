import { describe, it, expect } from 'vitest';
import { formatKm, haversineKm } from '../src/lib/geo';

describe('haversineKm', () => {
  it('titik yang sama berjarak nol', () => {
    expect(haversineKm({ lat: 2.6, lng: 98.8 }, { lat: 2.6, lng: 98.8 })).toBe(0);
  });

  it('Jakarta ke Bandung sekitar 120 km garis lurus', () => {
    const km = haversineKm({ lat: -6.2088, lng: 106.8456 }, { lat: -6.9175, lng: 107.6191 });
    expect(km).toBeGreaterThan(110);
    expect(km).toBeLessThan(125);
  });
});

describe('formatKm', () => {
  it('di bawah 1 km ditampilkan dalam meter', () => {
    expect(formatKm(0.5)).toBe('500 m');
  });

  it('1 km ke atas memakai koma desimal Indonesia', () => {
    expect(formatKm(3.456)).toBe('3,46 km');
  });

  it('nilai tidak valid menjadi strip', () => {
    expect(formatKm(Number.NaN)).toBe('-');
  });
});
