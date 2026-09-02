<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            font-size: 10pt;
            line-height: 1.5;
        }

        h1, h2, h3, p {
            margin: 0;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .header-table td {
            vertical-align: top;
        }

        .brand-title {
            font-size: 20pt;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: -0.5px;
        }

        .brand-subtitle {
            font-size: 9pt;
            color: #64748b;
            margin-top: 2px;
        }

        .invoice-badge-container {
            text-align: right;
        }

        .invoice-title {
            font-size: 16pt;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
        }

        .status-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-paid {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }

        .status-proforma {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }

        .info-table td {
            padding: 14px 16px;
            vertical-align: top;
            width: 50%;
        }

        .info-section-title {
            font-size: 8pt;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .meta-row {
            margin-bottom: 3px;
            font-size: 9pt;
        }

        .meta-label {
            color: #64748b;
            display: inline-block;
            width: 110px;
        }

        .meta-value {
            font-weight: 600;
            color: #0f172a;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .items-table th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 10px 12px;
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9.5pt;
        }

        .text-right {
            text-align: right !important;
        }

        .text-center {
            text-align: center !important;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .totals-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .totals-label {
            text-align: right;
            padding-right: 16px;
            color: #64748b;
            font-size: 9.5pt;
        }

        .totals-value {
            text-align: right;
            width: 140px;
            font-size: 9.5pt;
            font-weight: 600;
            color: #0f172a;
        }

        .grand-total-row td {
            padding-top: 10px;
            border-top: 2px solid #0f172a;
            font-size: 12pt;
            font-weight: bold;
            color: #0f172a;
        }

        .payment-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            margin-top: 20px;
            font-size: 8.5pt;
            color: #475569;
        }

        .footer {
            margin-top: 36px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <table class="header-table">
        <tr>
            <td>
                <div class="brand-title">HUMI HRIS</div>
                <div class="brand-subtitle">Platform Manajemen SDM & Penggajian Terpadu</div>
            </td>
            <td class="invoice-badge-container">
                <div class="invoice-title">{{ $invoice->status === 'paid' ? 'INVOICE' : 'PROFORMA INVOICE' }}</div>
                <div>
                    <span class="status-badge {{ $invoice->status === 'paid' ? 'status-paid' : 'status-proforma' }}">
                        {{ $invoice->status === 'paid' ? 'LUNAS / PAID' : 'MENUNGGU PEMBAYARAN' }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Info Sections -->
    <table class="info-table">
        <tr>
            <td>
                <div class="info-section-title">Ditagihkan Kepada:</div>
                <div style="font-weight: bold; font-size: 11pt; color: #0f172a;">
                    {{ $user?->company_name ?: ($companySetting?->name ?: $user?->name) }}
                </div>
                <div class="meta-row" style="margin-top: 4px;">
                    <span class="meta-label">Nama Kontak:</span>
                    <span class="meta-value">{{ $user?->name ?: '-' }}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Email:</span>
                    <span class="meta-value">{{ $user?->email ?: '-' }}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">WhatsApp / Telp:</span>
                    <span class="meta-value">{{ $user?->phone ?: '-' }}</span>
                </div>
            </td>
            <td>
                <div class="info-section-title">Detail Tagihan:</div>
                <div class="meta-row">
                    <span class="meta-label">Nomor Invoice:</span>
                    <span class="meta-value">{{ $invoice->invoice_number }}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Tanggal Terbit:</span>
                    <span class="meta-value">{{ $invoice->created_at ? $invoice->created_at->format('d/m/Y') : '-' }}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Jatuh Tempo:</span>
                    <span class="meta-value">{{ $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y') : '-' }}</span>
                </div>
                @if($invoice->status === 'paid' && $invoice->paid_at)
                    <div class="meta-row">
                        <span class="meta-label">Tanggal Bayar:</span>
                        <span class="meta-value" style="color: #15803d;">{{ \Carbon\Carbon::parse($invoice->paid_at)->format('d/m/Y H:i') }}</span>
                    </div>
                @endif
                <div class="meta-row">
                    <span class="meta-label">Metode Bayar:</span>
                    <span class="meta-value">{{ strtoupper($invoice->payment_method ?: 'QRIS') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Line Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 45%;">Deskripsi Layanan</th>
                <th class="text-center" style="width: 15%;">Jumlah Karyawan</th>
                <th class="text-right" style="width: 15%;">Tarif / Karyawan</th>
                <th class="text-right" style="width: 20%;">Total (IDR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>
                    <strong>Langganan Humi HRIS ({{ $planName }}) - 1 Bulan</strong>
                    <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">
                        Akses penuh fitur operasional HR, presensi GPS, payroll, dan manajemen karyawan.
                    </div>
                </td>
                <td class="text-center">{{ number_format($invoice->employee_count, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($unitPrice, 0, ',', '.') }}</td>
                <td class="text-right"><strong>Rp {{ number_format($subtotal, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- Totals -->
    <table class="totals-table">
        <tr>
            <td style="width: 50%;"></td>
            <td class="totals-label">Subtotal:</td>
            <td class="totals-value">Rp {{ number_format($subtotal, 0, ',', '.') }}</td>
        </tr>
        @if($paymentFee > 0)
            <tr>
                <td></td>
                <td class="totals-label">Biaya Transaksi / Payment Fee:</td>
                <td class="totals-value">Rp {{ number_format($paymentFee, 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr class="grand-total-row">
            <td></td>
            <td class="totals-label" style="font-weight: bold; color: #0f172a;">Total Pembayaran:</td>
            <td class="totals-value" style="font-weight: bold; color: #0f172a;">Rp {{ number_format($total, 0, ',', '.') }}</td>
        </tr>
    </table>

    <!-- Notes / Payment info -->
    <div class="payment-info">
        <strong>Catatan & Ketentuan Pembayaran:</strong>
        <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            <li>Invoice ini diterbitkan otomatis oleh sistem sebagai tagihan perpanjangan masa aktif (renewal) layanan Humi HRIS.</li>
            @if($invoice->status !== 'paid')
                <li>Silakan lakukan pembayaran melalui kode bayar QRIS yang tersedia pada portal billing dashboard Anda.</li>
                <li>Setelah pembayaran terkonfirmasi, masa aktif langganan Anda akan otomatis diperpanjang secara instan.</li>
            @else
                <li>Pembayaran untuk invoice ini telah diverifikasi dan lunas. Terima kasih atas kepercayaan Anda menggunakan Humi HRIS.</li>
            @endif
        </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
        Humi HRIS &bull; Dokumen ini sah dan diterbitkan secara elektronik oleh sistem komputer.
    </div>
</body>
</html>
