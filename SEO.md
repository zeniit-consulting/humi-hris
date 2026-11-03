# SEO Humi HRIS

Metadata halaman publik dikelola di `config/seo.php`. Artikel memakai `HumiNews`, dan lowongan memakai data lowongan yang dipublikasikan. `SeoMetadata` menghasilkan properti Inertia `seo`; Blade memakai properti yang sama saat SSR tidak tersedia. Tag fallback memiliki atribut `inertia` agar React menggantinya saat navigasi, tanpa menumpuk canonical atau meta tag.

## Pemetaan keyword

| URL | Fokus pencarian |
| --- | --- |
| `/` | Aplikasi HRIS Indonesia, manajemen karyawan |
| `/software-hris` | Software HRIS cloud, sistem HRIS Indonesia |
| `/features` | Fitur HRIS, absensi, payroll, portal karyawan |
| `/contact` | Demo dan konsultasi HRIS |
| `/hris-outsourcing` | HRIS outsourcing, payroll dan billing klien |
| `/hris-retail-fnb` | HRIS retail/F&B, shift dan payroll outlet |
| `/hris-manufaktur-shift` | HRIS manufaktur, roster shift dan lembur |
| `/berita` | Panduan HRIS, absensi dan payroll |
| `/careers` | Lowongan kerja dan karier |

Keyword di atas adalah pemetaan berdasarkan isi produk, bukan hasil pengukuran volume pencarian. Meta keywords dipertahankan sebagai label topik; Google tidak menggunakannya untuk ranking. Gunakan laporan kueri Search Console untuk menguji relevansi, impresi, dan CTR, lalu sesuaikan konten secara alami.

## Pemeriksaan lokal

```sh
php artisan seo:check
php artisan test --compact tests/Feature/SeoInfrastructureTest.php tests/Feature/LandingPageTest.php tests/Feature/CareerPortalTest.php
npm run build
```

`seo:check` memeriksa URL dasar, metadata kosong/duplikat, panjang metadata, gambar Open Graph, tautan artikel internal, dan konfigurasi verifikasi. Warning verifikasi kosong wajar sebelum akun webmaster disiapkan. Perintah ini tidak mengukur ranking, traffic, atau Core Web Vitals.

Sitemap menghilangkan `lastmod` untuk halaman statis yang belum memiliki tanggal editorial tepercaya. Artikel dan lowongan memakai tanggal pembaruan sumber. Hanya lowongan terbit yang belum tutup yang masuk sitemap. Halaman filter lowongan dan `/landing-v2` diberi noindex. Pagination lowongan memiliki canonical per halaman. Endpoint privat mendapat `X-Robots-Tag: noindex, nofollow`; autentikasi tetap mengatur akses data.

## Setelah deployment

1. Isi `APP_URL` dengan domain HTTPS utama. Pastikan server mengarahkan HTTP/domain alternatif ke domain tersebut dengan redirect permanen.
2. Tambahkan properti situs di [Google Search Console](https://search.google.com/search-console) dan [Bing Webmaster Tools](https://www.bing.com/webmasters/). Jika memakai verifikasi HTML, isi token resmi akun ke `GOOGLE_SITE_VERIFICATION` dan `BING_SITE_VERIFICATION`, lalu jalankan `php artisan config:cache`. Verifikasi DNS juga dapat digunakan tanpa token HTML.
3. Kirim URL `/sitemap.xml` melalui kedua layanan. Periksa `/robots.txt`, beberapa URL artikel, canonical, dan status indexing memakai URL Inspection.
4. Untuk merender seluruh konten sebelum JavaScript, build SSR dengan `npm run build:ssr` dan kelola `php artisan inertia:start-ssr` menggunakan process manager sesuai deployment aplikasi. Metadata fallback tetap tersedia bila proses SSR berhenti; fallback ini tidak merender isi halaman. Uji SSR pada halaman publik sebelum mengaktifkannya di produksi.
5. Periksa halaman dengan [Rich Results Test](https://search.google.com/test/rich-results) dan [PageSpeed Insights](https://pagespeed.web.dev/). Schema valid tidak menjamin rich result. `robots.txt` bukan pengganti autentikasi atau perlindungan berkas privat.
6. Catat baseline Search Console untuk 28 hari: klik organik, impresi, CTR, posisi rata-rata, halaman tujuan, dan kueri. Bandingkan periode setara setelah rilis; jangan menyimpulkan kenaikan traffic hanya dari lolosnya pemeriksaan teknis.

Google Analytics yang sudah terpasang tetap digunakan. Perubahan ini tidak menambahkan akun analytics atau mengirim sitemap ke akun webmaster secara otomatis.

## Referensi

- [Google: meta tags yang didukung](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Google: dasar SEO JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: sitemap dan lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
