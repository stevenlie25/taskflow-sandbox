# TaskFlow

Aplikasi web berbahasa Indonesia untuk mengatur tugas dan menjaga fokus dengan sesi 15 menit. HTML, CSS, dan JavaScript tanpa framework, dependensi paket, akun, API key, database cloud, integrasi AI, atau layanan berbayar.

## Menjalankan

Gunakan Node.js 22 atau lebih baru. Tidak perlu `npm install`. Jalankan dari direktori utama repository:

```sh
npm run dev
```

Buka http://localhost:5173. Hentikan server dengan Ctrl+C.

```sh
npm test
npm run build
```

Build memeriksa sintaks JavaScript dan menyalin aplikasi ke `dist/`, siap disajikan melalui hosting statis. GitHub Actions menjalankan tes dan build pada setiap pull request dan push ke `main`, serta menyimpan artefak build.

## Fitur

- Tambah, ubah, hapus dengan konfirmasi, dan tandai tugas selesai.
- Filter tugas serta progres jumlah dan persentase.
- Pilih atau lepaskan satu tugas sebagai fokus utama.
- Timer 15 menit: mulai, jeda, lanjutkan, dan berhenti.
- Ringkasan tugas selesai, total waktu fokus, dan lima sesi terakhir.
- Penyimpanan lokal otomatis untuk tugas, fokus, timer, dan sesi.
- Tampilan responsif, navigasi keyboard, serta panduan keadaan kosong.

## Menggunakan fokus

Tambahkan tugas, pilih **Fokus**, lalu **Mulai fokus**. Fokus bersifat opsional: semua tugas tetap terlihat dan dapat dikelola selama timer berjalan. Untuk mengganti tugas fokus, hentikan sesi terlebih dahulu. Menyelesaikan atau menghapus tugas fokus mengakhiri sesi dan mencatat waktu yang digunakan. Berhenti tidak otomatis menyelesaikan tugas.

Timer menggunakan waktu nyata, termasuk ketika tab tidak aktif atau halaman dimuat ulang. Waktu jeda tidak dihitung. Jika browser ditutup saat timer berjalan, waktu sampai batas 15 menit tetap dihitung ketika dibuka lagi. Total waktu mencakup sesi parsial, sesi selesai, dan sesi berjalan. Lima sesi terakhir ditampilkan, seluruh riwayat tetap disimpan untuk total.

## Penyimpanan dan batasan

Data memakai `localStorage` pada browser dan alamat situs yang sama, tanpa sinkronisasi antarperangkat. Menghapus data situs akan menghapus tugas dan sesi. Jika penyimpanan diblokir atau penuh, aplikasi memberi pesan dan tetap bekerja selama halaman terbuka. Gunakan satu tab aktif untuk menghindari saling menimpa data antar-tab.

## Struktur

- `index.html` dan `styles.css`: struktur halaman dan tampilan responsif.
- `app.js`: interaksi tugas, fokus, dialog, dan penyimpanan.
- `state.js`: perhitungan timer, sesi, dan validasi data.
- `test/state.test.js`: pengujian timer dan pemulihan data.
- `scripts/`: server lokal dan build statis.
- `.github/workflows/build.yml`: pemeriksaan otomatis.
