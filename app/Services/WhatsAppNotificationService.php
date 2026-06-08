<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\Subscription;
use App\Models\User;
use App\Support\WhatsAppPhone;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificationService
{
    public function __construct(private readonly WahaClient $wahaClient) {}

    public function notifyLeaveStatus(LeaveRequest $leave): void
    {
        $employee = $leave->employee;
        if (! $employee?->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $typeLabel = match ($leave->leave_type) {
            'annual' => 'Tahunan',
            'sick' => 'Sakit',
            'unpaid' => 'Tidak Dibayar',
            default => 'Lainnya',
        };
        $startDate = $leave->start_date?->locale('id')->translatedFormat('d F Y');
        $endDate = $leave->end_date?->locale('id')->translatedFormat('d F Y');
        $totalDays = (int) $leave->total_days;

        $message = match ($leave->status) {
            'approved' => "✅ *Pengajuan Cuti Disetujui*\n\nHai {$employee->full_name},\nPengajuan cuti {$typeLabel} Anda *disetujui*.\n\n📅 Tanggal: {$startDate} s/d {$endDate} ({$totalDays} hari)\n\nSelamat beristirahat! 🌴",
            'rejected' => "❌ *Pengajuan Cuti Ditolak*\n\nHai {$employee->full_name},\nMohon maaf, pengajuan cuti {$typeLabel} Anda *ditolak*.\n\n📅 Tanggal: {$startDate} s/d {$endDate}\n".($leave->rejection_reason ? "💬 Alasan: {$leave->rejection_reason}\n" : '')."\nSilakan hubungi HRD untuk informasi lebih lanjut.",
            default => null,
        };

        if (! $message) {
            return;
        }

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.leave_notify.failed', [
                'leave_id' => $leave->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyOvertimeStatus(OvertimeRequest $overtime): void
    {
        $employee = $overtime->employee;
        if (! $employee?->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $workDate = $overtime->work_date?->locale('id')->translatedFormat('d F Y');
        $totalHours = number_format((float) $overtime->total_hours, 1, ',', '');

        $message = match ($overtime->status) {
            'approved' => "✅ *Pengajuan Lembur Disetujui*\n\nHai {$employee->full_name},\nPengajuan lembur Anda *disetujui*.\n\n📅 Tanggal: {$workDate}\n⏱ Durasi: {$totalHours} jam",
            'rejected' => "❌ *Pengajuan Lembur Ditolak*\n\nHai {$employee->full_name},\nMohon maaf, pengajuan lembur Anda *ditolak*.\n\n📅 Tanggal: {$workDate}\n".($overtime->notes ? "💬 Catatan: {$overtime->notes}" : ''),
            default => null,
        };

        if (! $message) {
            return;
        }

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.overtime_notify.failed', [
                'overtime_id' => $overtime->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyContractExpiry(Employee $employee, int $daysLeft): void
    {
        if (! $employee->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $message = "⚠️ *Pengingat Kontrak Kerja*\n\nHai {$employee->full_name},\nKontrak kerja Anda akan berakhir dalam *{$daysLeft} hari*.\n\nSilakan hubungi tim HRD untuk informasi perpanjangan kontrak.\n\nTerima kasih. 🙏";

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.contract_expiry.failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyNewRegistration(User $user): void
    {
        if (! config('services.waha.enabled')) {
            return;
        }

        $chatId = (string) config('services.waha.registration_group_chat_id');

        if ($chatId === '') {
            return;
        }

        $registeredAt = $user->created_at?->timezone(config('app.timezone'))->format('d M Y H:i') ?? now()->format('d M Y H:i');
        $message = implode("\n", [
            '🆕 *Registrasi Akun Baru*',
            '',
            '*Nama:* '.$user->name,
            '*Perusahaan:* '.($user->company_name ?: '-'),
            '*Email:* '.($user->email ?: '-'),
            '*WhatsApp:* '.($user->phone ?: '-'),
            '*Role:* '.$user->role,
            '*Waktu:* '.$registeredAt,
            '*User ID:* '.$user->id,
        ]);

        try {
            $this->wahaClient->sendText($chatId, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.registration_notify.failed', [
                'user_id' => $user->id,
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifySubscriptionRenewalReminder(Subscription $subscription): void
    {
        $user = $subscription->user;

        if (! config('services.waha.enabled')) {
            return;
        }

        if (! $user) {
            return;
        }

        $planLabel = match ($subscription->plan_slug) {
            'free' => 'Free Trial',
            'core' => 'Basic',
            'plus' => 'Plus',
            default => strtoupper($subscription->plan_slug),
        };
        $endDate = $subscription->current_period_end?->locale('id')->translatedFormat('d F Y');

        $message = implode("\n", [
            '⏰ *Reminder Renewal Plan Humi*',
            '',
            'Halo '.$user->name.',',
            'Plan *'.$planLabel.'* untuk '.($user->company_name ?: 'akun Anda').' akan berakhir pada *'.$endDate.'*.',
            '',
            'Mohon lakukan renewal sebelum tanggal tersebut agar akses HRIS tetap aktif.',
            '',
            'Buka menu Billing di dashboard Humi untuk membuat invoice renewal.',
        ]);

        if ($user->phone && WhatsAppPhone::isValid($user->phone)) {
            try {
                $this->wahaClient->sendTextToPhone($user->phone, $message);
            } catch (\Throwable $e) {
                Log::warning('whatsapp.subscription_renewal_reminder.failed', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $user->id,
                    'target' => 'user',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $groupChatId = (string) config('services.waha.subscription_renewal_group_chat_id');

        if ($groupChatId === '') {
            return;
        }

        $groupMessage = implode("\n", [
            '⏰ *Reminder Expired Berlangganan H-7*',
            '',
            '*Perusahaan:* '.($user->company_name ?: '-'),
            '*Nama Owner:* '.$user->name,
            '*Email:* '.($user->email ?: '-'),
            '*WhatsApp:* '.($user->phone ?: '-'),
            '*Paket:* '.$planLabel,
            '*Karyawan Aktif:* '.$subscription->employee_count,
            '*Berakhir:* '.$endDate,
            '*User ID:* '.$user->id,
            '*Subscription ID:* '.$subscription->id,
            '',
            'Mohon follow up renewal agar akses HRIS tidak expired.',
        ]);

        try {
            $this->wahaClient->sendText($groupChatId, $groupMessage);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.subscription_renewal_group_reminder.failed', [
                'subscription_id' => $subscription->id,
                'user_id' => $user->id,
                'target' => 'group',
                'chat_id' => $groupChatId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyBirthday(Employee $employee): void
    {
        if (! $employee->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $message = "🎂 *Selamat Ulang Tahun!*\n\nHai {$employee->full_name},\nSeluruh tim HRD mengucapkan selamat ulang tahun untuk Anda. Semoga panjang umur, sehat selalu, dan sukses dalam berkarya! 🎉🎊";

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.birthday_notify.failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyKasbonReminder(Employee $employee, float $totalKasbon): void
    {
        if (! $employee->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $formatted = 'Rp '.number_format($totalKasbon, 0, ',', '.');

        $message = "💰 *Pengingat Kasbon*\n\nHai {$employee->full_name},\nAnda memiliki sisa kasbon sebesar *{$formatted}* yang akan dipotong pada payroll berikutnya.\n\nMohon pastikan saldo kasbon Anda segera diselesaikan. Terima kasih. 🙏";

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.kasbon_reminder.failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function notifyProbation(Employee $employee, int $daysSinceHire): void
    {
        if (! $employee->phone || ! WhatsAppPhone::isValid($employee->phone)) {
            return;
        }
        if (! config('services.waha.enabled')) {
            return;
        }

        $message = "📋 *Pengingat Masa Percobaan*\n\nHai {$employee->full_name},\nAnda telah bergabung selama *{$daysSinceHire} hari* dengan status percobaan (probation).\n\nSilakan hubungi tim HRD untuk evaluasi kinerja dan status kepegawaian Anda. Terima kasih. 🙏";

        try {
            $this->wahaClient->sendTextToPhone($employee->phone, $message);
        } catch (\Throwable $e) {
            Log::warning('whatsapp.probation_notify.failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
