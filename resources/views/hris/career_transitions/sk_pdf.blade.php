<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        @page {
            margin: 28px 38px;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10.5pt;
            line-height: 1.45;
            color: #111827;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 8px;
            margin-bottom: 16px;
        }
        .header-logo {
            max-height: 48px;
            margin-bottom: 4px;
        }
        .company-name {
            font-size: 15pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .company-address {
            font-size: 8.5pt;
            color: #4b5563;
            margin-top: 2px;
        }
        .header-divider {
            border-top: 1px solid #111827;
            margin-top: 2px;
        }
        .title-block {
            text-align: center;
            margin-bottom: 16px;
        }
        .doc-title {
            font-size: 13pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .doc-number {
            font-size: 10pt;
            font-weight: normal;
            margin-top: 3px;
        }
        .doc-subject {
            font-size: 10pt;
            font-weight: bold;
            margin-top: 6px;
            text-transform: uppercase;
        }
        .preamble {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        .table-section {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .table-section td {
            vertical-align: top;
            padding: 2.5px 0;
            font-size: 10pt;
        }
        .col-prefix {
            width: 100px;
            font-weight: bold;
        }
        .col-separator {
            width: 15px;
            text-align: center;
        }
        .col-content {
            text-align: justify;
        }
        .details-box {
            width: 100%;
            margin: 6px 0 10px 0;
            border-collapse: collapse;
        }
        .details-box td {
            padding: 3px 0;
            font-size: 9.5pt;
            vertical-align: top;
        }
        .details-label {
            width: 170px;
            color: #374151;
        }
        .details-sep {
            width: 12px;
            text-align: center;
        }
        .details-val {
            font-weight: bold;
            color: #111827;
        }
        .diktum-title {
            font-weight: bold;
            margin-top: 8px;
            margin-bottom: 2px;
        }
        .diktum-body {
            text-align: justify;
            margin-bottom: 6px;
        }
        .signature-table {
            width: 100%;
            margin-top: 24px;
            border-collapse: collapse;
            page-break-inside: avoid;
        }
        .signature-table td {
            vertical-align: top;
        }
        .sign-left {
            width: 50%;
            font-size: 9pt;
            color: #4b5563;
        }
        .sign-right {
            width: 50%;
            text-align: center;
        }
        .sign-date {
            font-size: 10pt;
            margin-bottom: 4px;
        }
        .sign-title {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .sign-space {
            height: 60px;
        }
        .sign-name {
            font-size: 10pt;
            font-weight: bold;
            text-decoration: underline;
        }
        .sign-position {
            font-size: 9pt;
            color: #374151;
        }
        .tembusan {
            margin-top: 14px;
            font-size: 8pt;
            color: #4b5563;
            border-top: 1px dashed #d1d5db;
            padding-top: 6px;
        }
        .badge {
            display: inline-block;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 9pt;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        @if (! empty($companySetting?->logo_path))
            <img class="header-logo" src="{{ public_path('storage/' . $companySetting->logo_path) }}" alt="Logo">
        @endif
        <div class="company-name">{{ $companySetting?->name ?? 'PERUSAHAAN' }}</div>
        @if (! empty($companySetting?->location_address))
            <div class="company-address">{{ $companySetting->location_address }}</div>
        @endif
        <div class="header-divider"></div>
    </div>

    <div class="title-block">
        <div class="doc-title">SURAT KEPUTUSAN DIREKSI</div>
        <div class="doc-number">Nomor: {{ $transition->letter_number ?: $transition->transition_number }}</div>
        <div class="doc-subject">TENTANG<br>{{ $transition->sk_title ?: 'MUTASI DAN PENETAPAN JABATAN KARYAWAN' }}</div>
    </div>

    <div class="preamble">
        DIREKSI {{ strtoupper($companySetting?->name ?? 'PERUSAHAAN') }}
    </div>

    <table class="table-section">
        <tr>
            <td class="col-prefix">Menimbang</td>
            <td class="col-separator">:</td>
            <td class="col-content">
                {!! nl2br(e($transition->sk_considerations ?: "a. Bahwa untuk mendukung efektivitas dan kelancaran kegiatan operasional perusahaan;\nb. Bahwa Saudara/i {$employee?->full_name} dinilai cakap dan memenuhi syarat untuk memangku amanah jabatan baru;\nc. {$transition->reason}")) !!}
            </td>
        </tr>
        <tr>
            <td class="col-prefix">Mengingat</td>
            <td class="col-separator">:</td>
            <td class="col-content">
                {!! nl2br(e($transition->sk_legal_basis ?: "1. Peraturan Perusahaan yang berlaku;\n2. Keputusan Manajemen dan Hasil Evaluasi Kinerja Karyawan;\n3. Kebutuhan organisasi dan struktur kerja perusahaan.")) !!}
            </td>
        </tr>
    </table>

    <div style="text-align: center; font-weight: bold; margin: 10px 0 6px 0; letter-spacing: 1px;">
        MEMUTUSKAN
    </div>

    <table class="table-section">
        <tr>
            <td class="col-prefix">Menetapkan</td>
            <td class="col-separator">:</td>
            <td class="col-content">
                <div class="diktum-title">PERTAMA :</div>
                <div class="diktum-body">
                    Menetapkan perubahan status kepegawaian (<strong>{{ \App\Models\CareerTransition::TRANSITION_TYPES[$transition->transition_type] ?? 'Mutasi Jabatan' }}</strong>) kepada karyawan:
                </div>

                <table class="details-box">
                    <tr>
                        <td class="details-label">Nama Karyawan</td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $employee?->full_name }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">NIP / ID Karyawan</td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $employee?->employee_code ?: '-' }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Jabatan Sebelumnya</td>
                        <td class="details-sep">:</td>
                        <td>{{ $transition->old_position_name ?: ($employee?->position?->name ?: '-') }}</td>
                    </tr>
                    <tr>
                        <td class="details-label">Divisi Sebelumnya</td>
                        <td class="details-sep">:</td>
                        <td>{{ $transition->old_division_name ?: ($employee?->division?->name ?: '-') }}</td>
                    </tr>
                    @if ($transition->old_sub_company_name)
                    <tr>
                        <td class="details-label">Entitas / Cabang Lama</td>
                        <td class="details-sep">:</td>
                        <td>{{ $transition->old_sub_company_name }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td colspan="3" style="padding-top: 4px; border-top: 1px dashed #e5e7eb;"></td>
                    </tr>
                    <tr>
                        <td class="details-label"><strong>Jabatan Baru</strong></td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $transition->new_position_name ?: $transition->old_position_name }}</td>
                    </tr>
                    <tr>
                        <td class="details-label"><strong>Divisi Baru</strong></td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $transition->new_division_name ?: $transition->old_division_name }}</td>
                    </tr>
                    @if ($transition->new_sub_company_name)
                    <tr>
                        <td class="details-label"><strong>Entitas / Cabang Baru</strong></td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $transition->new_sub_company_name }}</td>
                    </tr>
                    @endif
                    @if ($transition->new_employment_status)
                    <tr>
                        <td class="details-label">Status Hubungan Kerja</td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ ucfirst($transition->new_employment_status) }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="details-label">Tanggal Efektif Berlaku</td>
                        <td class="details-sep">:</td>
                        <td class="details-val">{{ $transition->effective_date?->translatedFormat('d F Y') ?: $transition->effective_date?->format('d/m/Y') }}</td>
                    </tr>
                </table>

                <div class="diktum-title">KEDUA :</div>
                <div class="diktum-body">
                    Sehubungan dengan ketetapan pada Diktum PERTAMA, kepada yang bersangkutan diberikan hak upah, fasilitas, dan kompensasi kerja sesuai dengan standar jabatan baru yang berlaku di lingkungan {{ $companySetting?->name ?? 'perusahaan' }}.
                    @if ($transition->new_base_salary)
                        Besaran Gaji Pokok baru ditetapkan sebesar <strong>Rp {{ number_format((float) $transition->new_base_salary, 0, ',', '.') }}</strong> per bulan.
                    @endif
                </div>

                <div class="diktum-title">KETIGA :</div>
                <div class="diktum-body">
                    Segala wewenang, tanggung jawab, dan inventaris dinas yang melekat pada jabatan sebelumnya wajib diserahterimakan selambat-lambatnya sebelum tanggal berlakunya Surat Keputusan ini dengan membuat Berita Acara Serah Terima (BAST).
                </div>

                <div class="diktum-title">KEEMPAT :</div>
                <div class="diktum-body">
                    Surat Keputusan ini mulai berlaku efektif sejak tanggal <strong>{{ $transition->effective_date?->translatedFormat('d F Y') ?: $transition->effective_date?->format('d/m/Y') }}</strong>. Apabila di kemudian hari terdapat kekeliruan dalam surat keputusan ini, akan diadakan perbaikan dan penyesuaian sebagaimana mestinya.
                </div>
            </td>
        </tr>
    </table>

    <table class="signature-table">
        <tr>
            <td class="sign-left">
                <div class="tembusan">
                    <strong>Tembusan Yth:</strong><br>
                    1. Direksi / Manajemen Perusahaan<br>
                    2. Departemen HR & Keuangan<br>
                    3. Atasan Langsung Unit Kerja Terkait<br>
                    4. Karyawan yang bersangkutan<br>
                    5. Arsip Personal File Karyawan
                </div>
            </td>
            <td class="sign-right">
                <div class="sign-date">
                    Ditetapkan di: {{ $companySetting?->location_name ?: 'Jakarta' }}<br>
                    Pada tanggal: {{ ($transition->first_approved_at ?: $transition->created_at)?->translatedFormat('d F Y') }}
                </div>
                <div class="sign-title">{{ $companySetting?->name ?? 'PERUSAHAAN' }}</div>
                <div class="sign-space"></div>
                <div class="sign-name">{{ $transition->sk_signer_name ?: 'Direksi Perusahaan' }}</div>
                <div class="sign-position">{{ $transition->sk_signer_position ?: 'Direktur / HR Management' }}</div>
            </td>
        </tr>
    </table>
</body>
</html>
