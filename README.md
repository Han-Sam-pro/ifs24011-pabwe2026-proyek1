# RoamPlan - Frontend (React)

Antarmuka web **RoamPlan Smart Trip Planner**: menyusun itinerary per hari, menambahkan destinasi di peta Google Maps, menyusun urutan kunjungan berdasarkan waktu atau jarak, dan melihat estimasi biaya. Backend Express.js ada di repository terpisah: `roamplan-backend`.

## Fitur
- **Masuk dan daftar** di halaman terpisah (`/auth/login`, `/auth/register`).
- **Beranda**: ringkasan rencana, destinasi, dan estimasi biaya.
- **Rencana perjalanan**: buat, ubah, cari, dan hapus rencana (maksimal 30 hari).
- **Itinerary per hari**: tambah, ubah, dan hapus destinasi; klik peta untuk mengisi koordinat.
- **Urutan kunjungan**: "Urutkan waktu" (jam kedatangan) dan "Urutkan jarak" (tetangga terdekat, Haversine).
- **Estimasi biaya**: biaya aktivitas, biaya transportasi (jarak rute), sisa anggaran, dan rincian per hari dan kategori.
- **Pengguna**: daftar seluruh pengguna RoamPlan dengan pencarian dan halaman.
- **Profil**: lihat dan ubah data diri, serta ganti kata sandi.

## Teknologi
React 19, Vite, React Router 7, lucide-react, Vitest + Testing Library, Google Maps JavaScript API.

## Struktur
```
src/{pages,components,context,lib}   tests/   public/   scripts/   docs/
```

## Menjalankan (pengembangan)
Jalankan backend lebih dulu (default http://localhost:4000), lalu:
```bash
npm ci
cp .env.example .env          # isi VITE_GOOGLE_MAPS_KEY
npm run dev                   # http://localhost:5173  (/api di-proxy ke VITE_PROXY_TARGET)
```

## Konfigurasi (`.env`)
| Variabel | Keterangan |
|---|---|
| `VITE_API_URL` | URL backend saat build. Kosongkan untuk dev (pakai proxy Vite) |
| `VITE_PROXY_TARGET` | Target proxy dev/preview Vite. Default `http://localhost:4000` |
| `VITE_GOOGLE_MAPS_KEY` | Kunci Google Maps JavaScript API milik sendiri. Tanpa kunci, peta dinonaktifkan dan koordinat diisi manual |

Kunci Google Maps dibaca saat build. Batasi kunci di Google Cloud Console (HTTP referrer) ke domain Anda.

## Pengujian dan build
```bash
npm test                  # Vitest (6 berkas, 48 test)
npm run test:coverage     # dengan cakupan (coverage/lcov.info untuk SonarQube)
npm run build             # hasil di dist/
```

## Deploy
`npm install` otomatis membangun `dist/` (dilewati bila `CI` terdeteksi), dan `npm start` menyajikan `dist/` dengan fallback SPA serta meneruskan `/api/*` ke `API_URL`.
Docker (nginx): `VITE_API_URL=https://api.contoh.app VITE_GOOGLE_MAPS_KEY=... docker compose up -d --build` lalu buka http://localhost:8080.
