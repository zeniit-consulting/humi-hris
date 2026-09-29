<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        @page {
            margin: 10mm 12mm 12mm 12mm;
            size: a4 landscape;
        }

        body {
            color: #1e293b;
            font-family: DejaVu Sans, sans-serif;
            font-size: 8.5px;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Section */
        .kop-table {
            border-collapse: collapse;
            margin-bottom: 4px;
            width: 100%;
        }

        .kop-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .kop-logo-td {
            text-align: left;
            width: 110px;
        }

        .kop-logo {
            display: block;
            max-height: 52px;
            max-width: 100px;
            object-fit: contain;
        }

        .kop-text-td {
            padding-left: 12px;
            text-align: left;
        }

        .kop-company-name {
            color: #0f172a;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .kop-company-details {
            color: #475569;
            font-size: 8.5px;
            line-height: 1.3;
        }

        .kop-separator {
            border-bottom: 1px solid #0f172a;
            border-top: 2.5px solid #0f172a;
            height: 2px;
            margin: 6px 0 10px 0;
        }

        /* Judul Laporan */
        .report-header {
            margin-bottom: 10px;
            text-align: center;
        }

        .report-title {
            color: #0f172a;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .report-subtitle {
            color: #475569;
            font-size: 9px;
            margin-top: 2px;
        }

        /* Ringkasan & Meta */
        .meta-container {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            margin-bottom: 10px;
            padding: 5px 8px;
        }

        .meta-table {
            border-collapse: collapse;
            font-size: 8px;
            width: 100%;
        }

        .meta-table td {
            border: none;
            padding: 2px 4px;
            vertical-align: middle;
        }

        .badge-stat {
            background-color: #e2e8f0;
            border-radius: 3px;
            display: inline-block;
            font-weight: 700;
            padding: 1px 5px;
        }

        .badge-present { background-color: #dcfce7; color: #166534; }
        .badge-late { background-color: #fee2e2; color: #991b1b; }
        .badge-leave { background-color: #dbeafe; color: #1e40af; }
        .badge-absent { background-color: #f1f5f9; color: #475569; }

        /* Tabel Data */
        table.data-table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #cbd5e1;
            font-size: 8px;
            padding: 4px 5px;
            vertical-align: middle;
            word-wrap: break-word;
        }

        table.data-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            text-align: center;
        }

        table.data-table tr:nth-child(even) td {
            background-color: #fafafa;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }

        .status-badge {
            border-radius: 3px;
            display: inline-block;
            font-size: 7.5px;
            font-weight: 700;
            padding: 2px 5px;
        }

        .status-present { background-color: #dcfce7; color: #166534; }
        .status-late { background-color: #fee2e2; color: #991b1b; }
        .status-on_leave { background-color: #dbeafe; color: #1e40af; }
        .status-absent { background-color: #f1f5f9; color: #64748b; }

        /* Footer */
        .footer {
            border-top: 1px solid #cbd5e1;
            bottom: 0;
            left: 0;
            margin-top: 14px;
            padding-top: 6px;
            position: fixed;
            right: 0;
            width: 100%;
        }

        .footer-table {
            border-collapse: collapse;
            width: 100%;
        }

        .footer-table td {
            border: none;
            color: #64748b;
            font-size: 8px;
            padding: 0;
        }
    </style>
</head>
<body>
    <!-- Kop Surat Perusahaan -->
    <table class="kop-table">
        <tr>
            @if (! empty($companyLogoSrc))
                <td class="kop-logo-td">
                    <img src="{{ $companyLogoSrc }}" class="kop-logo" alt="{{ $companyName }}">
                </td>
            @endif
            <td class="kop-text-td">
                <div class="kop-company-name">{{ $companyName }}</div>
                @if (! empty($companyDetails))
                    <div class="kop-company-details">{!! nl2br(e($companyDetails)) !!}</div>
                @endif
                @if (! empty($companyAddress) && ! str_contains((string) $companyDetails, (string) $companyAddress))
                    <div class="kop-company-details">{{ $companyAddress }}</div>
                @endif
            </td>
        </tr>
    </table>
    <div class="kop-separator"></div>

    <!-- Judul Laporan -->
    <div class="report-header">
        <div class="report-title">Laporan Kehadiran Karyawan</div>
        <div class="report-subtitle">Periode: {{ $dateRangeLabel }}</div>
    </div>

    <!-- Ringkasan & Meta -->
    <div class="meta-container">
        <table class="meta-table">
            <tr>
                <td style="width: 12%;"><strong>Status:</strong> {{ $statusFilterLabel }}</td>
                <td style="width: 12%;"><strong>Zona Waktu:</strong> {{ $timezoneAbbr }}</td>
                <td style="width: 12%;"><strong>Total Data:</strong> {{ $summary['total'] }}</td>
                <td style="text-align: right;">
                    <span style="margin-right: 6px;">Hadir: <span class="badge-stat badge-present">{{ $summary['present'] }}</span></span>
                    <span style="margin-right: 6px;">Terlambat: <span class="badge-stat badge-late">{{ $summary['late'] }}</span></span>
                    <span style="margin-right: 6px;">Cuti: <span class="badge-stat badge-leave">{{ $summary['on_leave'] }}</span></span>
                    <span>Absen: <span class="badge-stat badge-absent">{{ $summary['absent'] }}</span></span>
                </td>
            </tr>
        </table>
    </div>

    <!-- Tabel Kehadiran -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 3.5%;">No</th>
                <th style="width: 8%;">Tanggal</th>
                <th style="width: 9%;">Kode Pegawai</th>
                <th style="width: 17%;">Nama Karyawan</th>
                <th style="width: 8%;">Status</th>
                <th style="width: 11%;">Keterlambatan</th>
                <th style="width: 8.5%;">Check-In</th>
                <th style="width: 8.5%;">Check-Out</th>
                <th style="width: 7.5%;">Zona Waktu</th>
                <th style="width: 19%;">Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td class="center">{{ $row['attendance_date'] }}</td>
                    <td>{{ $row['employee_code'] }}</td>
                    <td><strong>{{ $row['full_name'] }}</strong></td>
                    <td class="center">
                        <span class="status-badge status-{{ $row['status'] }}">
                            {{ $row['status_label'] }}
                        </span>
                    </td>
                    <td>{{ $row['late_info'] }}</td>
                    <td class="center">{{ $row['check_in'] ?? '-' }}</td>
                    <td class="center">{{ $row['check_out'] ?? '-' }}</td>
                    <td class="center">{{ $row['timezone'] }}</td>
                    <td>{{ $row['notes'] ?: '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" class="center" style="color: #64748b; padding: 18px;">
                        Tidak ada data kehadiran untuk rentang filter ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer: Hanya di sini teks "Generated by Humi" ditampilkan -->
    <div class="footer">
        <table class="footer-table">
            <tr>
                <td style="text-align: left;">
                    Dicetak pada: {{ $generatedAt }} ({{ $timezoneAbbr }})
                </td>
                <td style="text-align: right; font-style: italic; font-weight: 600;">
                    Generated by Humi
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
