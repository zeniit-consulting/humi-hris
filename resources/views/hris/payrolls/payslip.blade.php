<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            color: #0f172a;
            margin: 2.5px;
            font-size: 9pt;
        }

        h1, h2, h3, p {
            margin: 0;
        }

        .shell {
            border: 1px solid #dbe3ea;
            border-radius: 12px;
            overflow: hidden;
        }

        .hero {
            background: #f8fafc;
            color: #0f172a;
            padding: 16px 18px;
        }

        .hero-table {
            width: 100%;
            border-collapse: collapse;
        }

        .hero-table td {
            vertical-align: top;
        }

        .logo-cell {
            width: 140px;
            text-align: right;
        }

        .company-logo {
            max-width: 125px;
            max-height: 69px;
            object-fit: contain;
        }

        .hero h1 {
            font-size: 18px;
            margin-top: 4px;
        }

        .muted {
            color: #64748b;
        }

        .hero .muted {
            color: #64748b;
        }

        .section {
            padding: 8px 12px;
            border-top: 1px solid #e2e8f0;
        }

        .grid {
            width: 100%;
            border-collapse: collapse;
            font-size: 6pt !important;
            line-height: 1.12;
        }

        .grid td {
            padding: 0.7px 0 !important;
            font-size: 6pt !important;
            line-height: 1.12;
            vertical-align: top;
        }

        .label {
            width: 100px;
            color: #64748b;
        }

        .columns {
            width: 100%;
            border-collapse: collapse;
        }

        .columns > tbody > tr > td {
            width: 50%;
            vertical-align: top;
        }

        .columns > tbody > tr > td:first-child {
            padding-right: 4px;
        }

        .columns > tbody > tr > td:last-child {
            padding-left: 4px;
        }

        .panel-title {
            font-size: 7.5pt !important;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 4px;
            line-height: 1.1;
        }

        .money-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6pt !important;
            line-height: 1.12;
        }

        .money-table th,
        .money-table td {
            padding: 2.8px 0 !important;
            border-bottom: 1px solid #e2e8f0;
            font-size: 6pt !important;
            line-height: 1.12;
            text-align: left;
        }

        .money-table td:last-child,
        .money-table th:last-child {
            text-align: right;
        }

        .summary {
            margin-top: 6px;
            padding: 7px 11px;
            background: #f8fafc;
            border-radius: 10px;
            font-size: 6pt !important;
            line-height: 1.12;
        }

        .summary strong {
            float: right;
        }

        .take-home {
            margin-top: 8px;
            padding: 10px 12px;
            background: #0f172a;
            color: #fff;
            border-radius: 10px;
            font-size: 13px;
        }

        .take-home strong {
            float: right;
            font-size: 16px;
        }

    </style>
</head>
<body>
    <div class="shell">
        <div class="hero">
            <table class="hero-table">
                <tr>
                    <td>
                        <h1>Payslip {{ $periodLabel }}</h1>
                        <p class="muted" style="margin-top: 8px;">{{ $companyName }}</p>
                        <small class="muted" style="margin-top: 1px;">{{ $companyDetails }}</small>
                    </td>
                    <td class="logo-cell">
                        @if (is_file($companyLogoPath))
                            <img src="{{ $companyLogoPath }}" class="company-logo" alt="{{ $companyName }}">
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2 style="font-size: 9pt !important; margin-bottom: 4px; line-height: 1.1;">Informasi Karyawan</h2>
            <table class="grid">
                <tr>
                    <td class="label">Nama</td>
                    <td>{{ $employee->full_name }}</td>
                </tr>
                <tr>
                    <td class="label">ID Karyawan</td>
                    <td>{{ $employee->employee_code ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Email</td>
                    <td>{{ $employee->email ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Divisi</td>
                    <td>{{ $employee->division?->name ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Jabatan</td>
                    <td>{{ $employee->position?->name ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Periode</td>
                    <td>
                        <span>{{ $run->period_start?->locale('id')->translatedFormat('d M Y') ?: '-' }}</span>
                        -
                        <span>{{ $run->period_end?->locale('id')->translatedFormat('d M Y') ?: '-' }}</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <table class="columns">
                <tr>
                    <td>
                        <h2 class="panel-title">Basic & Allowance</h2>
                        <table class="money-table">
                            <tbody>
                                <tr>
                                    <td>Gaji Pokok</td>
                                    <td>Rp {{ number_format((float) $slip->base_salary, 0, ',', '.') }}</td>
                                </tr>
                                @foreach (($slip->allowance_breakdown ?? []) as $name => $amount)
                                    <tr>
                                        <td>{{ $name }}</td>
                                        <td>Rp {{ number_format((float) $amount, 0, ',', '.') }}</td>
                                    </tr>
                                @endforeach
                                @foreach (($slip->variable_allowance_breakdown ?? []) as $name => $amount)
                                    <tr>
                                        <td>{{ $name }} (Tidak Tetap)</td>
                                        <td>Rp {{ number_format((float) $amount, 0, ',', '.') }}</td>
                                    </tr>
                                @endforeach
                                @foreach (($slip->bonus_breakdown ?? []) as $name => $amount)
                                    <tr>
                                        <td>{{ $name }} (Bonus)</td>
                                        <td>Rp {{ number_format((float) $amount, 0, ',', '.') }}</td>
                                    </tr>
                                @endforeach
                                @if ((float) ($slip->pph21_allowance ?? 0) > 0)
                                    <tr>
                                        <td>Tunjangan PPh21</td>
                                        <td>Rp {{ number_format((float) ($slip->pph21_allowance ?? 0), 0, ',', '.') }}</td>
                                    </tr>
                                @endif
                            </tbody>
                        </table>
                    </td>
                    <td>
                        <h2 class="panel-title">Deduction & Tax</h2>
                        <table class="money-table">
                            <tbody>
                                <tr>
                                    <td>PPh21</td>
                                    <td>(Rp {{ number_format((float) ($slip->pph21_deduction ?? 0), 0, ',', '.') }})</td>
                                </tr>
                                <tr>
                                    <td>Kasbon</td>
                                    <td>(Rp {{ number_format((float) $slip->kasbon_deduction, 0, ',', '.') }})</td>
                                </tr>
                                <tr>
                                    <td>Denda</td>
                                    <td>(Rp {{ number_format((float) $slip->denda_deduction, 0, ',', '.') }})</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </table>
            <div class="summary">
                Total Penghasilan
                <strong>Rp {{ number_format((float) $slip->base_salary + (float) $slip->allowances_total + (float) ($slip->pph21_allowance ?? 0), 0, ',', '.') }}</strong>
            </div>
            <div class="summary">
                Total Potongan
                <strong>(Rp {{ number_format((float) $slip->deductions_total, 0, ',', '.') }})</strong>
            </div>
            <div class="take-home">
                Take Home Pay
                <strong>Rp {{ number_format((float) $slip->net_salary, 0, ',', '.') }}</strong>
            </div>
        </div>
    </div>
</body>
</html>
