<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kode OTP Humi</title>
</head>
<body style="margin:0;background:#f4f7f7;font-family:Arial,sans-serif;color:#16383b">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px">
        <div style="border:1px solid #d8e3e3;border-radius:16px;background:#ffffff;padding:32px">
            <p style="margin:0 0 8px;font-size:14px;color:#527074">Humi - Easy HR Management</p>
            <h1 style="margin:0 0 16px;font-size:24px">
                {{ $context === 'login' ? 'Kode OTP login portal' : 'Aktivasi akun Anda' }}
            </h1>
            <p style="margin:0 0 20px;line-height:1.6">Gunakan kode berikut untuk melanjutkan:</p>
            <div style="border-radius:12px;background:#e8fbf7;padding:18px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#006069">
                {{ $otp }}
            </div>
            <p style="margin:20px 0 0;line-height:1.6;color:#527074">Kode berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>
        </div>
    </div>
</body>
</html>
