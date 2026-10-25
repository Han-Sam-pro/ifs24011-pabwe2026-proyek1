# RoamPlan — Frontend

Aplikasi React + Vite + Tailwind untuk merencanakan perjalanan. Data pengguna dan itinerary disimpan oleh backend (lihat repo `roamplan-backend`).

## Menjalankan (development)

```bash
npm install
cp .env.example .env     # sesuaikan APP_PORT dan API_PROXY_TARGET
npm run dev
```

Pastikan backend sudah berjalan di `API_PROXY_TARGET` (default `http://localhost:3001`). Request ke `/api` otomatis diteruskan oleh proxy Vite.

## Build & preview

```bash
npm run build
npm run preview
```

## Menghubungkan ke backend

| Kondisi | Pengaturan |
| --- | --- |
| Dev (proxy Vite) | `API_PROXY_TARGET=http://localhost:3001` |
| Produksi, domain sama | tidak perlu diisi (`/api`) |
| Produksi, domain berbeda | `VITE_API_BASE_URL=https://api.domain.com/api` saat build, dan backend harus mengizinkan origin frontend lewat `CORS_ORIGIN` |

## Test

```bash
npm test
npm run test:coverage
```
