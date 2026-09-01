<?php

namespace App\Services;

use App\Models\AttendanceCorrectionRequest;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService
{
    public function __construct(
        private readonly TelegramBotService $bot,
        private readonly LeaveBalanceService $leaveBalanceService
    ) {}

    /**
     * Notify approver when a new request is created.
     */
    public function notifyApprover(string $type, LeaveRequest|OvertimeRequest|AttendanceCorrectionRequest|ShiftChangeRequest $item, ?Employee $approver): void
    {
        if (! $approver?->telegram_chat_id) {
            return;
        }

        $employee = $item->employee;
        $empName = $employee ? "{$employee->first_name} {$employee->last_name}" : 'Karyawan';
        $empCode = $employee?->employee_code ?? '-';

        $title = match ($type) {
            'leave' => '📝 <b>Pengajuan Cuti / Izin Baru</b>',
            'overtime' => '⏰ <b>Pengajuan Lembur Baru</b>',
            'attendance' => '📍 <b>Pengajuan Koreksi Absensi Baru</b>',
            'shift_change' => '🔄 <b>Pengajuan Tukar Shift Baru</b>',
            default => '📋 <b>Pengajuan Baru</b>',
        };

        $details = match ($type) {
            'leave' => "<b>Jenis:</b> " . ucfirst($item->leave_type ?? 'Cuti') . "\n<b>Tanggal:</b> " . Carbon::parse($item->start_date)->translatedFormat('d M Y') . " s/d " . Carbon::parse($item->end_date)->translatedFormat('d M Y') . " (" . (int)$item->total_days . " hari)\n<b>Alasan:</b> " . ($item->reason ?: '-'),
            'overtime' => "<b>Tanggal:</b> " . Carbon::parse($item->overtime_date)->translatedFormat('d M Y') . "\n<b>Jam:</b> " . substr($item->start_time, 0, 5) . " - " . substr($item->end_time, 0, 5) . " (" . $item->duration_hours . " jam)\n<b>Pekerjaan:</b> " . ($item->notes ?: '-'),
            'attendance' => "<b>Tanggal:</b> " . Carbon::parse($item->attendance_date)->translatedFormat('d M Y') . "\n<b>Jam Masuk:</b> " . ($item->clock_in_time ?: '-') . "\n<b>Jam Pulang:</b> " . ($item->clock_out_time ?: '-') . "\n<b>Alasan:</b> " . ($item->reason ?: '-'),
            'shift_change' => "<b>Tanggal Shift:</b> " . Carbon::parse($item->schedule_date)->translatedFormat('d M Y') . "\n<b>Alasan:</b> " . ($item->reason ?: '-'),
            default => '',
        };

        $text = "{$title}\n\n"
            . "<b>Karyawan:</b> {$empName} ({$empCode})\n"
            . "{$details}\n\n"
            . "Silakan pilih tindakan:";

        $inlineKeyboard = [
            [
                ['text' => '✅ Setujui', 'callback_data' => "appr:{$type}:{$item->id}"],
                ['text' => '❌ Tolak', 'callback_data' => "rejc:{$type}:{$item->id}"],
            ]
        ];

        $this->bot->sendMessage($approver->telegram_chat_id, $text, 'HTML', $inlineKeyboard);
    }

    /**
     * Notify employee about request status update (approved or rejected).
     */
    public function notifyEmployeeRequestStatus(string $type, LeaveRequest|OvertimeRequest|AttendanceCorrectionRequest|ShiftChangeRequest $item, string $status, ?string $reason = null): void
    {
        $employee = $item->employee;
        if (! $employee?->telegram_chat_id) {
            return;
        }

        $typeLabel = match ($type) {
            'leave' => 'Cuti / Izin',
            'overtime' => 'Lembur',
            'attendance' => 'Koreksi Absensi',
            'shift_change' => 'Tukar Shift',
            default => 'Pengajuan',
        };

        $isApproved = $status === 'approved';
        $icon = $isApproved ? '✅' : '❌';
        $statusText = $isApproved ? 'DISETUJUI' : 'DITOLAK';

        $text = "{$icon} <b>Status Pengajuan {$typeLabel}</b>\n\n"
            . "Hai <b>{$employee->first_name}</b>, pengajuan {$typeLabel} Anda telah <b>{$statusText}</b>.";

        if (! $isApproved && ! empty($reason)) {
            $text .= "\n\n💬 <b>Alasan:</b> {$reason}";
        }

        $this->bot->sendMessage($employee->telegram_chat_id, $text);
    }

    /**
     * Send monthly Payslip PDF to employee's Telegram.
     */
    public function sendPayslipPdf(PayrollItem $item): bool
    {
        $employee = $item->employee;
        if (! $employee?->telegram_chat_id) {
            return false;
        }

        $run = $item->payrollRun;
        $period = $run ? Carbon::createFromFormat('Y-m', $run->period)->translatedFormat('F Y') : now()->translatedFormat('F Y');

        try {
            $pdf = Pdf::loadView('pdf.payslip', [
                'item' => $item,
                'employee' => $employee,
                'run' => $run,
            ]);

            $pdfContent = $pdf->output();
            $filename = "Slip_Gaji_{$employee->employee_code}_{$run?->period}.pdf";
            $caption = "📄 <b>Slip Gaji Periode {$period}</b>\n\nHalo <b>{$employee->first_name}</b>, berikut terlampir slip gaji Anda.";

            $res = $this->bot->sendDocument($employee->telegram_chat_id, $pdfContent, $filename, $caption);
            return (bool) ($res['ok'] ?? false);
        } catch (\Throwable $e) {
            Log::warning('telegram.payslip_send.failed', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send daily attendance recap to company's Telegram Group/Channel.
     */
    public function sendDailyAttendanceSummary(int $userId): void
    {
        $setting = CompanySetting::withoutGlobalScopes()->where('user_id', $userId)->first();
        if (! $setting?->telegram_group_chat_id) {
            return;
        }

        $today = Carbon::today();
        $dateStr = $today->toDateString();
        $formattedDate = $today->translatedFormat('l, d F Y');

        $employees = Employee::withoutGlobalScopes()
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        $totalEmployees = $employees->count();
        if ($totalEmployees === 0) {
            return;
        }

        $employeeIds = $employees->pluck('id')->all();

        $attendances = EmployeeAttendance::withoutGlobalScopes()
            ->whereIn('employee_id', $employeeIds)
            ->where('attendance_date', $dateStr)
            ->get()
            ->keyBy('employee_id');

        $leaves = LeaveRequest::withoutGlobalScopes()
            ->whereIn('employee_id', $employeeIds)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $dateStr)
            ->whereDate('end_date', '>=', $dateStr)
            ->get()
            ->keyBy('employee_id');

        $presentCount = 0;
        $lateCount = 0;
        $leaveCount = 0;
        $absentCount = 0;
        $lateList = [];
        $leaveList = [];

        foreach ($employees as $emp) {
            $att = $attendances->get($emp->id);
            $leave = $leaves->get($emp->id);

            if ($att && $att->clock_in_at) {
                $presentCount++;
                if ($att->is_late) {
                    $lateCount++;
                    $lateList[] = "- {$emp->first_name} {$emp->last_name} (" . Carbon::parse($att->clock_in_at)->format('H:i') . ")";
                }
            } elseif ($leave) {
                $leaveCount++;
                $leaveList[] = "- {$emp->first_name} {$emp->last_name} (" . ucfirst($leave->leave_type) . ")";
            } else {
                $absentCount++;
            }
        }

        $text = "📊 <b>Rekap Kehadiran Harian - {$formattedDate}</b>\n"
            . "🏢 <b>{$setting->name}</b>\n\n"
            . "👥 Total Karyawan: <b>{$totalEmployees}</b>\n"
            . "✅ Hadir: <b>{$presentCount}</b>\n"
            . "⏰ Terlambat: <b>{$lateCount}</b>\n"
            . "🌴 Izin/Cuti: <b>{$leaveCount}</b>\n"
            . "❓ Belum Absen/Alpha: <b>{$absentCount}</b>\n";

        if (! empty($lateList)) {
            $text .= "\n⚠️ <b>Daftar Terlambat:</b>\n" . implode("\n", array_slice($lateList, 0, 10));
            if (count($lateList) > 10) $text .= "\n...dan " . (count($lateList) - 10) . " lainnya";
        }

        if (! empty($leaveList)) {
            $text .= "\n\n🌴 <b>Sedang Cuti/Izin:</b>\n" . implode("\n", array_slice($leaveList, 0, 10));
        }

        $this->bot->sendMessage($setting->telegram_group_chat_id, $text);
    }
}
