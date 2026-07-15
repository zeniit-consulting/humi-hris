<?php

namespace App\Support;

use Illuminate\Support\Collection;

class HumiNews
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function all(): Collection
    {
        return collect(self::articles())->sortByDesc('published_at')->values();
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function find(string $slug): ?array
    {
        return self::all()->firstWhere('slug', $slug);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function articles(): array
    {
        return [
            [
                'title' => 'Apa Itu HRIS dan Bagaimana Cara Memilih Software HRIS untuk Perusahaan Indonesia?',
                'slug' => 'apa-itu-hris-cara-memilih-software-hris-indonesia',
                'category' => 'Panduan HRIS',
                'published_at' => '2026-07-08',
                'updated_at' => '2026-07-08',
                'reading_time' => '7 menit',
                'description' => 'Panduan ringkas tentang pengertian HRIS, fungsi utama, kriteria pemilihan, dan alasan perusahaan Indonesia perlu memakai sistem HR terpadu.',
                'keywords' => 'apa itu HRIS, software HRIS Indonesia, aplikasi HRIS, sistem informasi sumber daya manusia, human resource information system',
                'hero_summary' => 'HRIS adalah sistem informasi SDM yang menyatukan data karyawan, absensi, cuti, lembur, payroll, rekrutmen, dan approval agar tim HR tidak lagi bekerja dengan file terpisah.',
                'takeaways' => [
                    'HRIS membantu perusahaan menyatukan data dan proses HR dalam satu sistem.',
                    'Kriteria utama software HRIS adalah kelengkapan modul, kemudahan implementasi, keamanan data, dan kemampuan mengikuti struktur organisasi.',
                    'Humi HRIS dirancang untuk perusahaan Indonesia yang membutuhkan absensi, payroll, approval, dan portal karyawan dalam satu platform.',
                ],
                'sections' => [
                    [
                        'heading' => 'Apa itu HRIS?',
                        'body' => [
                            'HRIS adalah singkatan dari Human Resource Information System. Dalam operasional perusahaan, HRIS berfungsi sebagai pusat data dan proses HR: mulai dari profil karyawan, jabatan, dokumen, jadwal kerja, absensi, cuti, lembur, sampai payroll.',
                            'Tanpa HRIS, tim HR biasanya bekerja dengan banyak spreadsheet, chat approval, file slip gaji manual, dan data yang tersebar di beberapa folder. Pola kerja seperti ini sulit diaudit dan rawan selisih data saat jumlah karyawan bertambah.',
                        ],
                    ],
                    [
                        'heading' => 'Fungsi utama HRIS untuk perusahaan',
                        'body' => [
                            'Fungsi utama HRIS adalah membuat data HR lebih rapi dan proses administrasi lebih cepat. Modul yang paling sering dibutuhkan adalah database karyawan, absensi, jadwal shift, cuti, lembur, payroll, rekrutmen, dan portal karyawan.',
                            'Untuk manajemen, HRIS membantu membaca pola kehadiran, biaya payroll, status approval, dan kapasitas tenaga kerja. Untuk karyawan, HRIS memberi akses mandiri untuk melihat slip gaji, mengajukan cuti, dan memperbarui informasi tertentu.',
                        ],
                    ],
                    [
                        'heading' => 'Cara memilih software HRIS',
                        'body' => [
                            'Pilih software HRIS yang sesuai dengan proses perusahaan, bukan hanya yang daftar fiturnya paling panjang. Periksa apakah sistem mendukung struktur divisi dan jabatan, approval bertingkat, absensi shift, perhitungan payroll, serta kebutuhan role akses.',
                            'Perusahaan Indonesia juga perlu memperhatikan kemudahan import data, dukungan implementasi, biaya per karyawan, dan apakah vendor memahami proses HR lokal seperti kasbon, lembur, cuti, dan slip gaji.',
                        ],
                    ],
                    [
                        'heading' => 'Kapan perusahaan perlu memakai HRIS?',
                        'body' => [
                            'Perusahaan mulai membutuhkan HRIS saat data karyawan sering tidak sinkron, proses payroll memakan waktu lama, approval cuti terlambat, atau absensi lapangan sulit dipantau. Gejala lain adalah HR harus menggabungkan banyak file setiap akhir bulan.',
                            'Humi HRIS cocok untuk bisnis yang ingin memulai digitalisasi HR secara bertahap: mulai dari data karyawan dan absensi, lalu naik ke payroll, rekrutmen, asset management, dan performance tracker.',
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'Apa perbedaan HRIS dan aplikasi absensi?',
                        'answer' => 'Aplikasi absensi fokus pada pencatatan kehadiran. HRIS lebih luas karena mengelola data karyawan, absensi, cuti, lembur, payroll, rekrutmen, approval, dan portal karyawan.',
                    ],
                    [
                        'question' => 'Apakah HRIS cocok untuk perusahaan kecil?',
                        'answer' => 'Ya. Perusahaan kecil bisa memakai HRIS sejak awal agar data karyawan, jadwal, cuti, dan payroll tidak berantakan saat tim bertambah.',
                    ],
                    [
                        'question' => 'Apa modul HRIS yang sebaiknya diprioritaskan?',
                        'answer' => 'Prioritaskan data karyawan, absensi, cuti, lembur, dan payroll karena modul ini paling sering memengaruhi operasional harian dan perhitungan gaji.',
                    ],
                ],
                'related_links' => [
                    ['label' => 'Lihat fitur Humi HRIS', 'href' => '/features'],
                    ['label' => 'Konsultasi implementasi HRIS', 'href' => '/contact'],
                ],
            ],
            [
                'title' => 'Aplikasi Absensi Karyawan: Fitur yang Wajib Ada untuk Tim Shift, Lapangan, dan Multi Cabang',
                'slug' => 'aplikasi-absensi-karyawan-fitur-wajib-shift-lapangan-multi-cabang',
                'category' => 'Absensi',
                'published_at' => '2026-07-07',
                'updated_at' => '2026-07-07',
                'reading_time' => '6 menit',
                'description' => 'Pelajari fitur penting aplikasi absensi karyawan untuk perusahaan dengan shift, lokasi lapangan, multi cabang, cuti, lembur, dan payroll.',
                'keywords' => 'aplikasi absensi karyawan, absensi online, absensi shift, absensi lapangan, HRIS absensi payroll',
                'hero_summary' => 'Aplikasi absensi karyawan yang baik bukan hanya mencatat jam masuk dan pulang, tetapi juga menghubungkan jadwal, lokasi kerja, koreksi absensi, lembur, dan payroll.',
                'takeaways' => [
                    'Absensi harus terhubung dengan jadwal kerja agar keterlambatan dan lembur terbaca dengan benar.',
                    'Perusahaan multi cabang perlu pengaturan lokasi, role akses, dan laporan yang bisa dipisahkan per unit.',
                    'Integrasi absensi ke payroll mengurangi pekerjaan rekap manual di akhir bulan.',
                ],
                'sections' => [
                    [
                        'heading' => 'Mengapa absensi online penting?',
                        'body' => [
                            'Absensi online membantu perusahaan melihat kehadiran karyawan secara lebih cepat dibanding rekap manual. Tim HR dapat memeriksa siapa yang hadir, terlambat, cuti, lembur, atau belum melakukan clock-out.',
                            'Untuk perusahaan dengan shift, cabang, atau lokasi klien, absensi online memberi kontrol yang lebih jelas karena data masuk dari sumber yang sama dan dapat ditinjau oleh supervisor.',
                        ],
                    ],
                    [
                        'heading' => 'Fitur wajib aplikasi absensi karyawan',
                        'body' => [
                            'Fitur yang wajib ada meliputi jadwal shift, check-in dan check-out, lokasi kerja, koreksi absensi, pengajuan cuti, lembur, dan laporan bulanan. Fitur ini sebaiknya tidak berdiri sendiri, tetapi terhubung ke data karyawan dan payroll.',
                            'Humi mendukung alur absensi, jadwal, cuti, lembur, approval, dan payroll agar HR tidak perlu memindahkan data dari aplikasi absensi ke spreadsheet payroll secara manual.',
                        ],
                    ],
                    [
                        'heading' => 'Absensi untuk multi cabang dan lapangan',
                        'body' => [
                            'Perusahaan multi cabang membutuhkan pembagian data berdasarkan outlet, sub-company, lokasi klien, atau supervisor. Tanpa pemisahan ini, laporan kehadiran mudah tercampur dan sulit dipakai untuk evaluasi.',
                            'Pada bisnis outsourcing, retail, F&B, dan manufaktur shift, absensi juga harus bisa dibaca bersama kebutuhan operasional seperti roster, manpower request, lembur, dan billing klien.',
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'Apa fitur utama aplikasi absensi karyawan?',
                        'answer' => 'Fitur utama aplikasi absensi karyawan adalah check-in, check-out, jadwal shift, lokasi kerja, koreksi absensi, cuti, lembur, approval, dan laporan kehadiran.',
                    ],
                    [
                        'question' => 'Apakah absensi harus terhubung ke payroll?',
                        'answer' => 'Sebaiknya ya. Integrasi absensi ke payroll membantu menghitung keterlambatan, lembur, cuti tidak dibayar, dan komponen gaji lain dengan lebih konsisten.',
                    ],
                    [
                        'question' => 'Apakah Humi bisa dipakai untuk tim shift?',
                        'answer' => 'Ya. Humi menyediakan modul jadwal kerja, absensi, koreksi absensi, lembur, cuti, dan payroll yang relevan untuk operasional tim shift.',
                    ],
                ],
                'related_links' => [
                    ['label' => 'Solusi HRIS untuk retail dan F&B', 'href' => '/hris-retail-fnb'],
                    ['label' => 'Solusi HRIS untuk manufaktur shift', 'href' => '/hris-manufaktur-shift'],
                ],
            ],
            [
                'title' => 'Software Payroll Indonesia: Cara Mengurangi Selisih Gaji dari Absensi, Lembur, Cuti, dan Kasbon',
                'slug' => 'software-payroll-indonesia-absensi-lembur-cuti-kasbon',
                'category' => 'Payroll',
                'published_at' => '2026-07-06',
                'updated_at' => '2026-07-06',
                'reading_time' => '6 menit',
                'description' => 'Panduan memilih software payroll Indonesia yang terhubung dengan absensi, lembur, cuti, kasbon, komponen gaji, dan slip gaji.',
                'keywords' => 'software payroll Indonesia, aplikasi payroll, hitung gaji karyawan, slip gaji online, payroll HRIS',
                'hero_summary' => 'Software payroll membantu HR menghitung gaji dari data yang konsisten: kehadiran, lembur, cuti, kasbon, tunjangan, potongan, dan aturan perusahaan.',
                'takeaways' => [
                    'Payroll lebih akurat jika sumber data absensi dan lembur sudah berada di sistem yang sama.',
                    'Kasbon, tunjangan, potongan, dan denda perlu dicatat sebagai komponen payroll yang bisa diaudit.',
                    'Slip gaji digital membantu karyawan melihat rincian gaji tanpa menunggu dokumen manual.',
                ],
                'sections' => [
                    [
                        'heading' => 'Masalah payroll manual',
                        'body' => [
                            'Payroll manual sering bermasalah karena HR harus menggabungkan data absensi, lembur, cuti, kasbon, dan tunjangan dari file berbeda. Ketika satu sumber terlambat diperbarui, hasil gaji bisa ikut berubah.',
                            'Masalah lain adalah sulitnya audit. Jika ada karyawan bertanya kenapa nominal gaji berubah, HR harus menelusuri banyak file untuk menemukan sumber perhitungan.',
                        ],
                    ],
                    [
                        'heading' => 'Data yang perlu masuk ke software payroll',
                        'body' => [
                            'Software payroll yang baik perlu membaca data karyawan, periode gaji, kehadiran, keterlambatan, lembur, cuti, tunjangan, potongan, kasbon, dan komponen gaji lain. Semua data ini harus dapat ditinjau sebelum payroll disimpan.',
                            'Humi menghubungkan payroll dengan absensi, lembur, kasbon, dan data karyawan sehingga tim HR bisa memproses gaji dengan alur yang lebih rapi.',
                        ],
                    ],
                    [
                        'heading' => 'Slip gaji dan transparansi karyawan',
                        'body' => [
                            'Slip gaji digital memberi karyawan akses ke rincian pendapatan dan potongan. Transparansi ini mengurangi pertanyaan berulang ke HR dan membantu karyawan memahami komponen gaji.',
                            'Dalam operasional modern, payroll bukan hanya hitung nominal. Payroll juga harus punya riwayat, status, dokumen, dan kontrol akses agar data gaji tetap aman.',
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'Apa itu software payroll?',
                        'answer' => 'Software payroll adalah sistem untuk menghitung, menyimpan, dan mendistribusikan data penggajian karyawan berdasarkan komponen gaji, absensi, lembur, cuti, potongan, dan tunjangan.',
                    ],
                    [
                        'question' => 'Bagaimana software payroll mengurangi selisih gaji?',
                        'answer' => 'Software payroll mengurangi selisih gaji dengan memakai sumber data yang sama untuk absensi, lembur, cuti, kasbon, tunjangan, dan potongan sehingga HR tidak perlu rekap manual dari banyak file.',
                    ],
                    [
                        'question' => 'Apakah Humi punya modul payroll?',
                        'answer' => 'Ya. Humi memiliki modul payroll yang terhubung dengan data karyawan, absensi, lembur, kasbon, dan slip gaji.',
                    ],
                ],
                'related_links' => [
                    ['label' => 'Lihat fitur payroll Humi', 'href' => '/features'],
                    ['label' => 'Hubungi Humi untuk demo payroll', 'href' => '/contact'],
                ],
            ],
            [
                'title' => 'HRIS untuk Outsourcing: Mengelola Sub-Company, Lokasi Klien, Absensi Lapangan, dan Billing',
                'slug' => 'hris-outsourcing-sub-company-lokasi-klien-absensi-billing',
                'category' => 'Outsourcing',
                'published_at' => '2026-07-05',
                'updated_at' => '2026-07-05',
                'reading_time' => '7 menit',
                'description' => 'Artikel tentang kebutuhan HRIS untuk perusahaan outsourcing: sub-company, lokasi klien, manpower request, absensi lapangan, payroll, dan billing klien.',
                'keywords' => 'HRIS outsourcing, software outsourcing, absensi outsourcing, manpower request, billing klien outsourcing',
                'hero_summary' => 'Perusahaan outsourcing membutuhkan HRIS yang bisa memisahkan data per klien, lokasi, supervisor, dan tenaga kerja agar absensi, payroll, dan billing lebih mudah dikontrol.',
                'takeaways' => [
                    'Outsourcing membutuhkan struktur data yang berbeda dari perusahaan kantor biasa.',
                    'Sub-company, lokasi klien, supervisor, dan manpower request harus terhubung dengan absensi dan payroll.',
                    'Humi menyediakan halaman solusi khusus outsourcing untuk kebutuhan operasional tersebut.',
                ],
                'sections' => [
                    [
                        'heading' => 'Tantangan HR perusahaan outsourcing',
                        'body' => [
                            'Perusahaan outsourcing harus mengelola karyawan yang tersebar di banyak klien dan lokasi kerja. Data yang perlu dipantau bukan hanya jabatan internal, tetapi juga penempatan, supervisor, shift, absensi lapangan, dan kebutuhan manpower.',
                            'Jika semua data dicampur dalam satu spreadsheet, HR sulit melihat status karyawan per klien, laporan kehadiran per lokasi, dan dasar penagihan kepada klien.',
                        ],
                    ],
                    [
                        'heading' => 'Modul penting untuk outsourcing',
                        'body' => [
                            'HRIS untuk outsourcing sebaiknya mendukung sub-company, lokasi klien, manpower request, absensi lapangan, approval supervisor, payroll, dan billing klien. Modul ini membantu HR melihat hubungan antara kebutuhan tenaga kerja, kehadiran, biaya gaji, dan invoice.',
                            'Humi menempatkan kebutuhan outsourcing sebagai salah satu solusi utama karena prosesnya memang berbeda dari HR internal biasa.',
                        ],
                    ],
                    [
                        'heading' => 'Mengapa integrasi payroll dan billing penting?',
                        'body' => [
                            'Payroll menjawab berapa biaya tenaga kerja yang harus dibayarkan. Billing menjawab berapa nilai yang harus ditagihkan ke klien. Jika dua data ini tidak terhubung, margin operasional sulit dibaca.',
                            'Dengan alur yang lebih terstruktur, perusahaan outsourcing dapat mengurangi rekap manual dan mempercepat validasi data sebelum payroll dan billing diproses.',
                        ],
                    ],
                ],
                'faqs' => [
                    [
                        'question' => 'Apa HRIS yang cocok untuk perusahaan outsourcing?',
                        'answer' => 'HRIS yang cocok untuk outsourcing adalah sistem yang mendukung sub-company, lokasi klien, supervisor, manpower request, absensi lapangan, payroll, dan billing klien.',
                    ],
                    [
                        'question' => 'Mengapa outsourcing perlu data per klien?',
                        'answer' => 'Data per klien diperlukan agar perusahaan bisa memantau penempatan karyawan, absensi, kebutuhan manpower, biaya payroll, dan penagihan secara terpisah.',
                    ],
                    [
                        'question' => 'Apakah Humi punya solusi HRIS outsourcing?',
                        'answer' => 'Ya. Humi memiliki solusi HRIS outsourcing untuk mengelola sub-company, lokasi klien, manpower request, absensi lapangan, payroll, dan billing.',
                    ],
                ],
                'related_links' => [
                    ['label' => 'Buka solusi HRIS outsourcing', 'href' => '/hris-outsourcing'],
                    ['label' => 'Konsultasi kebutuhan outsourcing', 'href' => '/contact'],
                ],
            ],
        ];
    }
}
