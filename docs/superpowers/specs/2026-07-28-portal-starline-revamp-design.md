# Portal Karyawan — Starline Humi Revamp

## Tujuan

Memperbarui halaman index Portal Karyawan menjadi dashboard operasional yang cepat dibaca. Absensi hari ini tetap menjadi tugas utama, sementara ringkasan kebutuhan karyawan tersedia langsung di bawahnya.

## Pengguna dan arah visual

- Pengguna: karyawan yang mengakses portal untuk absensi dan layanan mandiri HRIS.
- Aksi utama: melihat atau melakukan absensi masuk/pulang sesuai status hari ini.
- Tone: profesional dan utilitarian.
- Referensi sistem: struktur dashboard Starline dari NeedMCP, dengan penyesuaian identitas Humi.
- Aksen: teal Humi menggantikan lime Starline pada CTA, indikator aktif, focus ring, dan highlight ringan.
- Tipografi: mempertahankan pasangan font portal yang ada agar konsisten dengan Humi.

## Struktur halaman

Macrostructure yang digunakan adalah **Operational Workbench**.

1. Header profil ringkas
   - Avatar/inisial, sapaan, jabatan, dan tombol keluar.
   - Tetap mengarah ke profil karyawan saat area profil dipilih.

2. Panel presensi utama
   - Status presensi dan tanggal hari ini.
   - Jam masuk dan pulang yang jelas dan mudah dipindai.
   - Nama serta jadwal shift.
   - Satu CTA kontekstual: mulai kerja, selesaikan kerja, lihat jadwal, atau lihat absensi.

3. Ringkasan karyawan
   - Grid dua kolom pada perangkat kecil untuk sisa cuti tahunan, cuti sakit, payroll terakhir, dan item yang membutuhkan perhatian.
   - Tidak membuat metrik baru; seluruh angka bersumber dari payload `/portal/api/summary` yang sudah ada.

4. Perlu perhatian
   - Menampilkan pengumuman, survei, atau aset yang membutuhkan tindakan.
   - Disajikan sebagai daftar ringkas dan dapat dipilih.

5. Akses cepat dan aktivitas
   - Mempertahankan tautan Absensi, Cuti, Lembur, Kasbon (bila aktif), Reimburse, dan Payroll.
   - Mempertahankan timeline aktivitas yang tersedia pada payload saat ini.

6. Navigasi
   - Bottom navigation dan rute portal yang sudah ada dipertahankan.
   - Tidak ada perubahan endpoint, format payload, atau aturan akses.

## Sistem visual

- Canvas terang bernuansa slate/teal dengan kartu translucent yang tetap memiliki kontras teks memadai.
- Kartu memiliki border lembut, radius besar yang terkontrol, dan elevasi rendah.
- Teal Humi menjadi satu-satunya aksen interaktif utama; warna sukses, peringatan, dan bahaya tetap semantik.
- Tidak menggunakan lime bawaan Starline.
- Interaksi hanya memakai opacity dan transform, dengan dukungan `prefers-reduced-motion`.
- Seluruh tombol dan tautan memiliki focus ring yang terlihat.

## Responsivitas dan aksesibilitas

- Prioritas mobile-first pada lebar 320, 375, dan 414 px; tablet pada 768 px.
- Tidak boleh ada horizontal overflow pada halaman utama.
- Semua CTA dan item navigasi tetap satu baris dan memiliki target sentuh yang memadai.
- Grid ringkasan tetap dua kolom selama konten dapat terbaca; turun menjadi satu kolom bila ruang tidak cukup.

## Batas perubahan

File yang akan diubah:

- `resources/js/pages/portal/index.tsx`
- `resources/js/pages/portal/navbar.tsx` hanya jika penyesuaian chrome navigasi diperlukan
- `tokens.css`
- `resources/css/app.css`

Tidak ada perubahan backend, migrasi, route, endpoint API, atau penghapusan fitur dalam scope ini.

## Verifikasi

- `npm run types:check`
- `npm run lint:check`
- `npm run build`
- Pemeriksaan visual mobile dan desktop pada halaman portal dengan data summary yang ada.
