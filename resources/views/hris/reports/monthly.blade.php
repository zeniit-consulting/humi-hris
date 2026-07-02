<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        body {
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            margin: 18px;
        }

        h1, h2, p {
            margin: 0;
        }

        h2 {
            font-size: 12px;
            margin: 14px 0 6px;
        }

        .header {
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 12px;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: 18px;
            margin-bottom: 4px;
        }

        .muted {
            color: #6b7280;
        }

        .summary {
            border-collapse: collapse;
            margin-bottom: 12px;
            width: 100%;
        }

        .summary td {
            border: 1px solid #d1d5db;
            padding: 7px;
            vertical-align: top;
            width: 16.66%;
        }

        .label {
            color: #6b7280;
            font-size: 8px;
            margin-bottom: 2px;
        }

        .value {
            font-size: 13px;
            font-weight: 700;
        }

        table.data {
            border-collapse: collapse;
            width: 100%;
        }

        .data th,
        .data td {
            border: 1px solid #d1d5db;
            padding: 5px;
            text-align: left;
        }

        .data th {
            background: #f3f4f6;
            font-weight: 700;
        }

        .right {
            text-align: right !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan HRIS Bulanan</h1>
        <p>{{ $company['name'] }}</p>
        <p class="muted">{{ $company['details'] }}</p>
        <p class="muted">Periode: {{ $period['label'] }} ({{ $period['start_label'] }} s/d {{ $period['end_label'] }})</p>
    </div>

    <table class="summary">
        <tr>
            <td>
                <div class="label">Karyawan Aktif</div>
                <div class="value">{{ $summary['active_employees'] }}</div>
            </td>
            <td>
                <div class="label">Hadir</div>
                <div class="value">{{ $summary['attendance']['present'] }}</div>
            </td>
            <td>
                <div class="label">Terlambat</div>
                <div class="value">{{ $summary['attendance']['late'] }}</div>
            </td>
            <td>
                <div class="label">Cuti Disetujui</div>
                <div class="value">{{ number_format((float) $summary['leave']['approved_days'], 2, ',', '.') }} hari</div>
            </td>
            <td>
                <div class="label">Lembur Disetujui</div>
                <div class="value">{{ number_format((float) $summary['overtime']['approved_hours'], 2, ',', '.') }} jam</div>
            </td>
            <td>
                <div class="label">Total Net Payroll</div>
                <div class="value">Rp {{ number_format((float) $summary['payroll']['net_salary'], 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    <h2>Dashboard Analitik</h2>
    <table class="summary">
        <tr>
            @foreach ($analytics['cards'] as $card)
                <td>
                    <div class="label">{{ $card['label'] }}</div>
                    <div class="value">
                        @if (($card['format'] ?? null) === 'currency')
                            Rp {{ number_format((float) $card['value'], 0, ',', '.') }}
                        @elseif (($card['format'] ?? null) === 'integer')
                            {{ number_format((float) $card['value'], 0, ',', '.') }}{{ isset($card['suffix']) ? ' '.$card['suffix'] : '' }}
                        @elseif (($card['format'] ?? null) === 'percent')
                            {{ number_format((float) $card['value'], 1, ',', '.') }}%
                        @else
                            {{ number_format((float) $card['value'], 2, ',', '.') }}{{ isset($card['suffix']) ? ' '.$card['suffix'] : '' }}
                        @endif
                    </div>
                </td>
            @endforeach
        </tr>
    </table>

    <h2>Absensi Bulanan Detail</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th class="right">Hari Tercatat</th>
                <th class="right">Hadir</th>
                <th class="right">Terlambat</th>
                <th class="right">Cuti</th>
                <th class="right">Absen</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($attendanceDetails as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td class="right">{{ $row['recorded_days'] }}</td>
                    <td class="right">{{ $row['present_count'] }}</td>
                    <td class="right">{{ $row['late_count'] }}</td>
                    <td class="right">{{ $row['on_leave_count'] }}</td>
                    <td class="right">{{ $row['absent_count'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Payroll Bulanan</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th class="right">Gaji Pokok</th>
                <th class="right">Tunjangan</th>
                <th class="right">Jam Lembur</th>
                <th class="right">Upah Lembur</th>
                <th class="right">Potongan</th>
                <th class="right">Take Home Pay</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($payrollDetails as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td class="right">Rp {{ number_format((float) $row['base_salary'], 0, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format((float) $row['allowances_total'], 0, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['overtime_hours'], 2, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format((float) $row['overtime_pay'], 0, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format((float) $row['deductions_total'], 0, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format((float) $row['net_salary'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8">Tidak ada data payroll pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Cuti & Sisa Cuti</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th class="right">Disetujui</th>
                <th class="right">Pending</th>
                <th class="right">Ditolak</th>
                <th class="right">Sisa Cuti</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($leaveDetails as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td class="right">{{ number_format((float) $row['approved_days'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['pending_days'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['rejected_days'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['remaining_balance'], 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Lembur</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th class="right">Approved</th>
                <th class="right">Pending</th>
                <th class="right">Rejected</th>
                <th class="right">Jam Approved</th>
                <th class="right">Jam Pending</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($overtimeDetails as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td class="right">{{ $row['approved_requests'] }}</td>
                    <td class="right">{{ $row['pending_requests'] }}</td>
                    <td class="right">{{ $row['rejected_requests'] }}</td>
                    <td class="right">{{ number_format((float) $row['approved_hours'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['pending_hours'], 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Mutasi Karyawan</h2>
    <table class="summary">
        <tr>
            <td>
                <div class="label">Karyawan Masuk</div>
                <div class="value">{{ $employeeMovementDetails['summary']['joiners'] }}</div>
            </td>
            <td>
                <div class="label">Karyawan Keluar</div>
                <div class="value">{{ $employeeMovementDetails['summary']['offboarded'] }}</div>
            </td>
            <td>
                <div class="label">Headcount Aktif</div>
                <div class="value">{{ $employeeMovementDetails['summary']['active_headcount'] }}</div>
            </td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>Tipe</th>
                <th>Kode</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($employeeMovementDetails['joiners'] as $row)
                <tr>
                    <td>Masuk</td>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td>{{ $row['hire_date'] ?: '-' }}</td>
                    <td>{{ $row['employment_status'] }}</td>
                </tr>
            @empty
            @endforelse
            @foreach ($employeeMovementDetails['offboarded'] as $row)
                <tr>
                    <td>Keluar</td>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td>{{ $row['offboarded_at'] ?: '-' }}</td>
                    <td>{{ $row['employment_status'] }}</td>
                </tr>
            @endforeach
            @if (empty($employeeMovementDetails['joiners']) && empty($employeeMovementDetails['offboarded']))
                <tr>
                    <td colspan="5">Tidak ada mutasi karyawan pada periode ini.</td>
                </tr>
            @endif
        </tbody>
    </table>

    <h2>Kontrak & Dokumen Expired</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Dokumen</th>
                <th>Nomor</th>
                <th>Expired</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($documentExpiryDetails as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td>{{ $row['document_type'] }}</td>
                    <td>{{ $row['document_number'] ?: '-' }}</td>
                    <td>{{ $row['expires_at'] ?: '-' }}</td>
                    <td>{{ $row['status'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6">Tidak ada dokumen expired atau hampir expired.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Asset Karyawan</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode Asset</th>
                <th>Asset</th>
                <th>Karyawan</th>
                <th>Kategori</th>
                <th>Issued</th>
                <th>Returned</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($assetAssignmentDetails as $row)
                <tr>
                    <td>{{ $row['asset_code'] }}</td>
                    <td>{{ $row['asset_name'] }}</td>
                    <td>{{ $row['employee_code'] }} - {{ $row['employee_name'] }}</td>
                    <td>{{ $row['asset_category'] }}</td>
                    <td>{{ $row['issued_at'] ?: '-' }}</td>
                    <td>{{ $row['returned_at'] ?: '-' }}</td>
                    <td>{{ $row['assignment_status'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data asset karyawan pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Performance/KPI</h2>
    <table class="summary">
        <tr>
            <td>
                <div class="label">Total Review</div>
                <div class="value">{{ $performanceDetails['summary']['reviews'] }}</div>
            </td>
            <td>
                <div class="label">Review Selesai</div>
                <div class="value">{{ $performanceDetails['summary']['completed_reviews'] }}</div>
            </td>
            <td>
                <div class="label">Rata-rata Final</div>
                <div class="value">{{ number_format((float) $performanceDetails['summary']['average_final_score'], 2, ',', '.') }}</div>
            </td>
            <td>
                <div class="label">At Risk</div>
                <div class="value">{{ $performanceDetails['summary']['at_risk'] }}</div>
            </td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Periode</th>
                <th>Status</th>
                <th class="right">OKR</th>
                <th class="right">KPI</th>
                <th class="right">Final</th>
                <th>Grade</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($performanceDetails['rows'] as $row)
                <tr>
                    <td>{{ $row['employee_code'] }}</td>
                    <td>{{ $row['employee_name'] }}</td>
                    <td>{{ $row['period_name'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td class="right">{{ number_format((float) $row['okr_score'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['kpi_score'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $row['final_score'], 2, ',', '.') }}</td>
                    <td>{{ $row['grade'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8">Tidak ada data performance pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Recruitment</h2>
    <table class="summary">
        <tr>
            <td>
                <div class="label">Lowongan Aktif</div>
                <div class="value">{{ $recruitmentDetails['summary']['active_vacancies'] }}</div>
            </td>
            <td>
                <div class="label">Lamaran Masuk</div>
                <div class="value">{{ $recruitmentDetails['summary']['applications'] }}</div>
            </td>
            <td>
                <div class="label">Diterima</div>
                <div class="value">{{ $recruitmentDetails['summary']['hired'] }}</div>
            </td>
            <td>
                <div class="label">Ditolak</div>
                <div class="value">{{ $recruitmentDetails['summary']['rejected'] }}</div>
            </td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>Lowongan</th>
                <th>Status</th>
                <th class="right">Kebutuhan</th>
                <th class="right">Lamaran</th>
                <th class="right">Diterima</th>
                <th class="right">Ditolak</th>
                <th>Closing</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($recruitmentDetails['vacancies'] as $row)
                <tr>
                    <td>{{ $row['title'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td class="right">{{ $row['openings'] }}</td>
                    <td class="right">{{ $row['applications_count'] }}</td>
                    <td class="right">{{ $row['hired_count'] }}</td>
                    <td class="right">{{ $row['rejected_count'] }}</td>
                    <td>{{ $row['closing_date'] ?: '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data recruitment pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Rincian Karyawan</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th class="right">Hadir</th>
                <th class="right">Terlambat</th>
                <th class="right">Cuti</th>
                <th class="right">Absen</th>
                <th class="right">Hari Cuti</th>
                <th class="right">Jam Lembur</th>
                <th class="right">Net Payroll</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($employees as $employee)
                <tr>
                    <td>{{ $employee['employee_code'] }}</td>
                    <td>{{ $employee['employee_name'] }}</td>
                    <td class="right">{{ $employee['present_count'] }}</td>
                    <td class="right">{{ $employee['late_count'] }}</td>
                    <td class="right">{{ $employee['on_leave_count'] }}</td>
                    <td class="right">{{ $employee['absent_count'] }}</td>
                    <td class="right">{{ number_format((float) $employee['leave_days'], 2, ',', '.') }}</td>
                    <td class="right">{{ number_format((float) $employee['overtime_hours'], 2, ',', '.') }}</td>
                    <td class="right">Rp {{ number_format((float) $employee['net_salary'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9">Tidak ada data karyawan pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
