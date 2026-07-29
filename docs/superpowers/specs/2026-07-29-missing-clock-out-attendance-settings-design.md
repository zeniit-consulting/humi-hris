# Lupa Absen Pulang dan Pengaturan Cut-off Absensi

## Tujuan

Memberi karyawan jalur khusus untuk mengajukan jam pulang yang terlupa pada absensi sebelumnya, dengan approval atasan dan batas pengajuan yang dikendalikan perusahaan. Batas tersebut menjaga data absensi dan payroll tetap terkunci setelah periode yang ditentukan.

## Ruang lingkup

Halaman Request Absensi portal memiliki dua kategori:

1. **Lupa Absen** untuk koreksi absensi manual yang sudah ada. Karyawan dapat mengajukan jam masuk, jam pulang, atau keduanya.
2. **Lupa Absen Pulang** untuk mengisi jam pulang pada attendance yang sudah memiliki `check_in_at` tetapi belum memiliki `check_out_at`.

Kedua kategori memakai `AttendanceCorrectionRequest` dan approval workflow attendance yang sudah ada. Tidak ada jalur approval baru; snapshot approver satu atau dua tingkat tetap mengikuti Pengaturan Approval.

## Pengaturan Absensi

Tambahkan halaman Pengaturan Absensi sebagai submenu Pengaturan yang terpisah dari Profil dan Pengaturan Payroll & Lembur. Pengaturan disimpan per perusahaan di `company_settings`.

Pengaturan yang tersedia:

- **Maksimum hari pengajuan lupa absen pulang**: bilangan hari kalender, default `2`. Nilai ini menghasilkan batas relatif H+N; absensi tanggal 1 dengan nilai 2 hanya dapat diajukan sampai tanggal 3, inklusif.
- **Tanggal cut-off absensi**: pilihan `1` sampai `28` atau `Akhir Bulan`. Nilai awal disediakan dengan default yang tidak lebih longgar dari batas H+2 yang berlaku, dan dapat diubah admin sesuai kebijakan periode perusahaan.

`Akhir Bulan` dihitung dari bulan kalender yang memuat tanggal absensi: 28 atau 29 Februari, 30, atau 31. Nilai ini bukan angka statis yang disimpan sebagai tanggal tertentu.

## Aturan kelayakan Lupa Absen Pulang

Server menghitung dua deadline, dengan zona waktu perusahaan/karyawan yang sama dengan absensi:

1. **Deadline relatif** = `attendance_date + maksimum_hari_pengajuan`.
2. **Deadline cut-off** = tanggal cut-off pada bulan `attendance_date`; untuk `Akhir Bulan`, gunakan hari terakhir bulan tersebut.

Deadline efektif adalah tanggal yang lebih awal dari keduanya. Request diizinkan selama tanggal lokal saat pengajuan masih pada atau sebelum deadline efektif.

Selain deadline, request hanya dapat dibuat bila:

- attendance milik karyawan dan perusahaan yang aktif sudah ada;
- attendance mempunyai clock-in namun belum mempunyai clock-out;
- belum ada request Lupa Absen Pulang berstatus pending untuk attendance tersebut;
- attendance belum diselesaikan oleh auto-sync missing checkout atau proses lain yang telah mengisi clock-out.

Jika tidak memenuhi syarat, API mengembalikan pesan yang menjelaskan apakah absensi telah lengkap, sudah ada request aktif, atau periode revisi telah ditutup.

## Data dan API

Tambahkan `request_type` pada `attendance_correction_requests` dengan nilai yang dibatasi pada `manual_attendance` dan `missing_clock_out`. Data lama dimigrasikan sebagai `manual_attendance`.

Endpoint portal yang sama tetap digunakan. Payload untuk `missing_clock_out` wajib berisi `attendance_date`, `check_out_at`, dan `reason`; `check_in_at` ditolak/diabaikan. Endpoint indeks serta payload admin memasukkan `request_type` agar label kategori dapat ditampilkan di portal dan halaman approval.

Controller approval yang sudah ada mempertahankan update parsial: saat request `missing_clock_out` disetujui, hanya `check_out_at` diperbarui. Hal ini memastikan clock-in, shift, timezone, dan data existing tidak tertimpa. Portal Approval mengikuti perilaku yang sama agar approval dari portal karyawan konsisten dengan approval admin.

## Pengalaman pengguna

Pada sheet Request Absensi, karyawan memilih kategori terlebih dahulu.

- Pada **Lupa Absen**, form tetap menampilkan tanggal, shift, waktu masuk, waktu pulang, dan alasan.
- Pada **Lupa Absen Pulang**, form menampilkan tanggal absensi yang eligible, shift terkait bila tersedia, satu input jam pulang, dan alasan. Tanggal tidak dapat dipilih di luar attendance eligible.

Riwayat request dan halaman Approval Absensi menampilkan label kategori yang mudah dibaca. Status approval, alasan penolakan, dan alur satu/dua line tidak berubah.

## Interaksi auto-sync dan cuti

`MissingCheckoutLeaveSyncService` tetap menjadi proses yang mengisi jam pulang otomatis dan, bila diaktifkan, memotong saldo cuti. Setelah sync mengisi `check_out_at`, karyawan tidak lagi dapat membuat request Lupa Absen Pulang untuk attendance tersebut. Request yang sudah pending tidak diubah otomatis oleh sync; admin/atasan menyelesaikannya melalui approval agar audit trail tidak hilang.

## Error handling dan keamanan

Seluruh kelayakan dihitung di controller/API berdasarkan employee dan owner yang terautentikasi, bukan hanya dari field form. Tanggal/waktu harus konsisten dengan tanggal attendance dan jam pulang tidak boleh lebih awal daripada clock-in. Pengaturan dibatasi untuk account owner melalui endpoint Settings.

## Pengujian

Tambahkan feature test untuk:

- default H+2 dan deadline yang inklusif;
- cut-off tanggal 1--28 dan Akhir Bulan, termasuk Februari tahun kabisat;
- penolakan setelah deadline efektif, attendance lengkap, dan request pending duplikat;
- snapshot approval dan approval final yang hanya memperbarui jam pulang;
- pengaturan absensi tersimpan per perusahaan;
- payload portal/admin yang memuat kategori.

Tambahkan test frontend terfokus untuk kategori form dan pengiriman payload. Setelah itu jalankan test PHP terfokus, lint/typecheck yang relevan, Wayfinder bila route baru ditambahkan, serta build produksi.
