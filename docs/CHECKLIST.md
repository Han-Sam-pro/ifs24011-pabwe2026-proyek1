# Checklist Kebutuhan RoamPlan

| Kebutuhan | Implementasi | Status |
|---|---|---|
| Aplikasi menyusun rencana perjalanan (tempat, waktu, anggaran) | Rencana dengan judul, destinasi, tanggal, anggaran; destinasi punya jam, durasi, dan biaya | Berhasil |
| Itinerary per hari | Halaman detail menampilkan tab per hari dan destinasi berurutan | Berhasil |
| Halaman login dan register dipisah | `/auth/login` dan `/auth/register` | Berhasil |
| Fitur users menampilkan semua pengguna | `/pengguna` dengan pencarian dan halaman (`GET /api/users`) | Berhasil |
| Fitur profil pengguna | `/profil` lihat dan ubah data, ganti kata sandi | Berhasil |
| Backend Express.js | `roamplan-backend`, Express 5 + SQLite | Berhasil |
| Menambahkan destinasi pada peta | Google Maps dengan marker bernomor dan rute; klik peta untuk koordinat | Berhasil (perlu `VITE_GOOGLE_MAPS_KEY`) |
| Estimasi biaya | Biaya aktivitas + transportasi (jarak x tarif/km), sisa anggaran | Berhasil |
| Urutan kunjungan berdasarkan waktu dan jarak | "Urutkan waktu" dan "Urutkan jarak" (tetangga terdekat, Haversine) | Berhasil |
| Struktur mengikuti zip referensi | Frontend mengikuti struktur zip; backend di repository terpisah | Berhasil |

Catatan: pengujian end-to-end Python (`e2e/`) dan `Jenkinsfile` dari referensi belum disertakan.
