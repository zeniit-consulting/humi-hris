<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
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
}
