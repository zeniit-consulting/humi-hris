<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentTitle }}</title>
    <style>
        @page {
            margin: 8mm;
        }

        body {
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 7px;
            margin: 0;
        }

        h1, p {
            margin: 0;
        }

        .header {
            border-bottom: 1px solid #9ca3af;
            margin-bottom: 8px;
            padding-bottom: 6px;
        }

        h1 {
            font-size: 14px;
            margin-bottom: 2px;
        }

        .muted {
            color: #6b7280;
        }

        .employee-record {
            margin-bottom: 8px;
            page-break-inside: avoid;
        }

        .employee-title {
            background: #e5e7eb;
            border: 1px solid #9ca3af;
            font-size: 8px;
            font-weight: 700;
            padding: 4px;
        }

        table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
        }

        th, td {
            border: 1px solid #d1d5db;
            overflow-wrap: break-word;
            padding: 2px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
        }

        th {
            background: #f3f4f6;
            font-weight: 700;
            width: 10%;
        }

        td {
            width: 15%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Export Data Karyawan</h1>
        <p>{{ $categoryLabel }}</p>
        <p class="muted">Dibuat pada {{ $generatedAt }}</p>
    </div>

    @forelse ($rows as $row)
        @php
            $record = array_combine($headers, $row);
        @endphp
        <div class="employee-record">
            <div class="employee-title">
                {{ $row[1] ?? 'Karyawan' }} - {{ $row[0] ?? '-' }}
            </div>
            <table>
                @foreach (array_chunk($record, 4, true) as $fields)
                <tr>
                    @foreach ($fields as $label => $value)
                        <th>{{ $label }}</th>
                        <td>{{ $value ?? '-' }}</td>
                    @endforeach
                    @for ($index = count($fields); $index < 4; $index++)
                        <th></th>
                        <td></td>
                    @endfor
                </tr>
                @endforeach
            </table>
        </div>
    @empty
        <p>Tidak ada data karyawan.</p>
    @endforelse
</body>
</html>
