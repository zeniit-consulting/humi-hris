<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Undangan Login Portal Humi</title>
</head>
<body style="margin:0;background:#f4f7f7;font-family:Arial,sans-serif;color:#16383b">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px">
        <div style="border:1px solid #d8e3e3;border-radius:16px;background:#ffffff;padding:32px">
            <p style="margin:0 0 8px;font-size:14px;color:#527074">Humi - Easy HR Management</p>
            <h1 style="margin:0 0 16px;font-size:24px">Undangan Login Portal Karyawan</h1>
            <p style="margin:0 0 20px;line-height:1.6">
                Halo {{ $employeeName }}, akun Portal Karyawan Humi Anda telah dibuat. Gunakan data berikut untuk masuk ke aplikasi.
            </p>

            <div style="border-radius:12px;background:#f1f7f7;padding:18px;margin-bottom:20px">
                <p style="margin:0 0 10px;font-size:13px;color:#527074">ID karyawan</p>
                <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#006069">{{ $username }}</p>
                <p style="margin:0 0 10px;font-size:13px;color:#527074">Nomor WhatsApp terdaftar</p>
                <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:1px;color:#006069">{{ $temporaryPassword }}</p>
            </div>

            <a href="{{ $loginUrl }}" style="display:inline-block;border-radius:10px;background:#006069;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:700">Masuk ke Portal Karyawan</a>

            <p style="margin:20px 0 0;line-height:1.6;color:#527074">
                Pastikan nomor WhatsApp Anda selalu sesuai dengan data karyawan. Jangan bagikan email ini kepada orang lain.
            </p>
        </div>
    </div>
</body>
</html>
