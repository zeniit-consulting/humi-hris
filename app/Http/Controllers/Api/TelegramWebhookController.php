<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeLeaveBalance;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use App\Services\ApprovalWorkflowService;
use App\Services\LeaveApprovalService;
use App\Services\TelegramBotService;
use App\Services\TelegramNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function __construct(
        private readonly TelegramBotService $bot,
        private readonly TelegramNotificationService $notificationService,
        private readonly ApprovalWorkflowService $workflowService
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $update = $request->all();

        // 1. Handle Callback Query (Inline buttons: Approve / Reject)
        if (isset($update['callback_query'])) {
            $this->handleCallbackQuery($update['callback_query']);
            return response()->json(['status' => 'ok']);
        }

        // 2. Handle Message / Commands (/start, /saldo_cuti, /jadwal, /slip, etc.)
        if (isset($update['message'])) {
            $this->handleMessage($update['message']);
            return response()->json(['status' => 'ok']);
        }

        return response()->json(['status' => 'ok']);
    }

    private function handleMessage(array $message): void
    {
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        $fromUsername = $message['from']['username'] ?? null;

        if (! $chatId || empty($text)) {
            return;
        }

        // Match commands
        if (str_starts_with($text, '/start')) {
            $this->handleStartCommand($chatId, $text, $fromUsername);
            return;
        }

        $employee = Employee::withoutGlobalScopes()->where('telegram_chat_id', (string) $chatId)->first();

        if (! $employee) {
            $this->bot->sendMessage(
                $chatId,
                "👋 <b>Selamat datang di HRIS Bot!</b>\n\nAkun Telegram Anda belum terhubung dengan data karyawan HRIS.\n\nUntuk menghubungkan akun, silakan ketik:\n<code>/link [KODE_KARYAWAN] [EMAIL]</code>\nContoh: <code>/link EMP-001 budi@example.com</code>"
            );
            return;
        }

        if (str_starts_with($text, '/link')) {
            $this->handleLinkCommand($chatId, $text, $fromUsername);
            return;
        }

        switch (strtolower(explode(' ', $text)[0])) {
            case '/saldo_cuti':
            case '/cuti':
                $this->handleSaldoCutiCommand($chatId, $employee);
                break;

            case '/jadwal':
            case '/shift':
                $this->handleJadwalCommand($chatId, $employee);
                break;

            case '/slip':
            case '/payslip':
                $this->handleSlipCommand($chatId, $employee);
                break;

            case '/help':
            case '/bantuan':
                $this->handleHelpCommand($chatId, $employee);
                break;

            default:
                $this->bot->sendMessage(
                    $chatId,
                    "Perintah tidak dikenali. Ketik /help untuk melihat daftar perintah yang tersedia."
                );
                break;
        }
    }

    private function handleStartCommand(int|string $chatId, string $text, ?string $username): void
    {
        $parts = explode(' ', $text);
        if (count($parts) > 1 && ! empty($parts[1])) {
            $token = trim($parts[1]);
            // Format token: link_{employeeId}_{hash}
            if (str_starts_with($token, 'link_')) {
                $sub = explode('_', $token);
                $empId = (int) ($sub[1] ?? 0);
                $emp = Employee::withoutGlobalScopes()->find($empId);
                if ($emp) {
                    $emp->update([
                        'telegram_chat_id' => (string) $chatId,
                        'telegram_username' => $username,
                    ]);

                    $user = User::withoutGlobalScopes()->where('email', $emp->email)->first();
                    if ($user) {
                        $user->update([
                            'telegram_chat_id' => (string) $chatId,
                            'telegram_username' => $username,
                        ]);
                    }

                    $this->bot->sendMessage(
                        $chatId,
                        "🎉 <b>Akun Berhasil Terhubung!</b>\n\nHalo <b>{$emp->first_name} {$emp->last_name}</b>, Telegram Anda kini sudah tersambung dengan sistem HRIS.\n\nKetik /help untuk melihat fitur yang tersedia."
                    );
                    return;
                }
            }
        }

        $this->bot->sendMessage(
            $chatId,
            "👋 <b>Selamat datang di HRIS Bot!</b>\n\nUntuk menghubungkan akun Telegram Anda dengan profil karyawan di sistem, silakan gunakan perintah:\n<code>/link [KODE_KARYAWAN] [EMAIL]</code>\n\nContoh:\n<code>/link EMP-001 budi@example.com</code>"
        );
    }

    private function handleLinkCommand(int|string $chatId, string $text, ?string $username): void
    {
        $parts = preg_split('/\s+/', $text);
        if (count($parts) < 3) {
            $this->bot->sendMessage(
                $chatId,
                "⚠️ Format salah. Gunakan format:\n<code>/link [KODE_KARYAWAN] [EMAIL]</code>\nContoh: <code>/link EMP-001 budi@example.com</code>"
            );
            return;
        }

        $code = trim($parts[1]);
        $email = trim($parts[2]);

        $employee = Employee::withoutGlobalScopes()
            ->where('employee_code', $code)
            ->where('email', $email)
            ->where('is_active', true)
            ->first();

        if (! $employee) {
            $this->bot->sendMessage(
                $chatId,
                "❌ Data karyawan dengan kode <code>{$code}</code> dan email <code>{$email}</code> tidak ditemukan atau tidak aktif."
            );
            return;
        }

        $employee->update([
            'telegram_chat_id' => (string) $chatId,
            'telegram_username' => $username,
        ]);

        $user = User::withoutGlobalScopes()->where('email', $email)->first();
        if ($user) {
            $user->update([
                'telegram_chat_id' => (string) $chatId,
                'telegram_username' => $username,
            ]);
        }

        $this->bot->sendMessage(
            $chatId,
            "🎉 <b>Berhasil Terhubung!</b>\n\nHalo <b>{$employee->first_name} {$employee->last_name}</b> ({$employee->employee_code}), akun Telegram Anda telah berhasil ditautkan!\n\nKetik /help untuk bantuan perintah."
        );
    }

    private function handleSaldoCutiCommand(int|string $chatId, Employee $employee): void
    {
        $balance = EmployeeLeaveBalance::withoutGlobalScopes()
            ->where('employee_id', $employee->id)
            ->where('balance_year', now()->year)
            ->first();

        $remaining = $balance ? (float) $balance->remaining_days : 0;
        $total = $balance ? (float) $balance->total_quota : 0;
        $used = $balance ? (float) $balance->used_days : 0;

        $text = "🌴 <b>Informasi Saldo Cuti ({$employee->first_name})</b>\n\n"
            . "📅 Tahun: <b>" . now()->year . "</b>\n"
            . "✨ Total Kuota: <b>{$total} hari</b>\n"
            . "📤 Terpakai: <b>{$used} hari</b>\n"
            . "🎯 <b>Sisa Cuti: {$remaining} hari</b>";

        $this->bot->sendMessage($chatId, $text);
    }

    private function handleJadwalCommand(int|string $chatId, Employee $employee): void
    {
        $today = Carbon::today();
        $endOfWeek = $today->copy()->addDays(6);

        $schedules = EmployeeSchedule::withoutGlobalScopes()
            ->with('shift')
            ->where('employee_id', $employee->id)
            ->whereBetween('schedule_date', [$today->toDateString(), $endOfWeek->toDateString()])
            ->orderBy('schedule_date')
            ->get();

        if ($schedules->isEmpty()) {
            $this->bot->sendMessage($chatId, "📅 Belum ada jadwal kerja untuk 7 hari ke depan.");
            return;
        }

        $lines = ["📅 <b>Jadwal Kerja 7 Hari ke Depan:</b>\n"];
        foreach ($schedules as $sch) {
            $dayName = Carbon::parse($sch->schedule_date)->translatedFormat('l, d M');
            $shiftName = $sch->shift?->name ?? 'Libur/Off';
            $hours = ($sch->shift && $sch->shift->start_time) ? substr($sch->shift->start_time, 0, 5) . " - " . substr($sch->shift->end_time, 0, 5) : 'Libur';
            $lines[] = "• <b>{$dayName}:</b> {$shiftName} ({$hours})";
        }

        $this->bot->sendMessage($chatId, implode("\n", $lines));
    }

    private function handleSlipCommand(int|string $chatId, Employee $employee): void
    {
        $lastItem = PayrollItem::withoutGlobalScopes()
            ->with(['payrollRun', 'employee'])
            ->where('employee_id', $employee->id)
            ->whereHas('payrollRun', fn ($q) => $q->where('is_saved', true))
            ->latest('id')
            ->first();

        if (! $lastItem) {
            $this->bot->sendMessage($chatId, "ℹ️ Belum ada slip gaji yang tersimpan untuk akun Anda.");
            return;
        }

        $this->bot->sendMessage($chatId, "⏳ Sedang menyiapkan slip gaji terakhir Anda...");
        $this->notificationService->sendPayslipPdf($lastItem);
    }

    private function handleHelpCommand(int|string $chatId, Employee $employee): void
    {
        $text = "🤖 <b>Menu Perintah HRIS Bot</b>\n\n"
            . "👤 <b>Karyawan:</b> {$employee->first_name} ({$employee->employee_code})\n\n"
            . "🌴 /saldo_cuti - Cek sisa kuota cuti tahunan\n"
            . "📅 /jadwal - Cek jadwal shift 7 hari ke depan\n"
            . "📄 /slip - Unduh slip gaji periode terakhir\n"
            . "❓ /help - Tampilkan pesan bantuan ini";

        $this->bot->sendMessage($chatId, $text);
    }

    private function handleCallbackQuery(array $callbackQuery): void
    {
        $callbackId = $callbackQuery['id'] ?? '';
        $data = $callbackQuery['data'] ?? '';
        $fromChatId = $callbackQuery['message']['chat']['id'] ?? null;
        $messageId = $callbackQuery['message']['message_id'] ?? null;
        $fromUser = $callbackQuery['from'] ?? [];
        $fromTelegramId = (string) ($fromUser['id'] ?? '');

        // Format callback data: appr:{type}:{id} or rejc:{type}:{id}
        $parts = explode(':', $data);
        if (count($parts) < 3) {
            $this->bot->answerCallbackQuery($callbackId, 'Perintah tidak valid.', true);
            return;
        }

        $action = $parts[0]; // appr or rejc
        $type = $parts[1];   // leave, overtime, attendance, shift_change
        $itemId = (int) $parts[2];

        // Find Approver User by Telegram Chat ID
        $approverUser = User::withoutGlobalScopes()->where('telegram_chat_id', $fromTelegramId)->first();
        if (! $approverUser) {
            $approverEmp = Employee::withoutGlobalScopes()->where('telegram_chat_id', $fromTelegramId)->first();
            if ($approverEmp) {
                $approverUser = User::withoutGlobalScopes()->where('email', $approverEmp->email)->first();
            }
        }

        if (! $approverUser) {
            $this->bot->answerCallbackQuery($callbackId, 'Akun Telegram Anda tidak terdaftar sebagai approver.', true);
            return;
        }

        $requestModel = match ($type) {
            'leave' => LeaveRequest::withoutGlobalScopes()->find($itemId),
            'overtime' => OvertimeRequest::withoutGlobalScopes()->find($itemId),
            'attendance' => AttendanceCorrectionRequest::withoutGlobalScopes()->find($itemId),
            'shift_change' => ShiftChangeRequest::withoutGlobalScopes()->find($itemId),
            default => null,
        };

        if (! $requestModel) {
            $this->bot->answerCallbackQuery($callbackId, 'Data pengajuan tidak ditemukan.', true);
            return;
        }

        if ($requestModel->status !== 'pending') {
            $this->bot->answerCallbackQuery($callbackId, 'Pengajuan ini sudah diproses sebelumnya.', true);
            if ($fromChatId && $messageId) {
                $this->bot->editMessageText(
                    $fromChatId,
                    $messageId,
                    $callbackQuery['message']['text'] . "\n\n⚠️ <i>(Sudah diproses dengan status: {$requestModel->status})</i>"
                );
            }
            return;
        }

        try {
            if ($action === 'appr') {
                $workflowResult = $this->workflowService->approve($requestModel, $approverUser);

                if ($workflowResult === ApprovalWorkflowService::ADVANCED) {
                    $this->bot->answerCallbackQuery($callbackId, 'Approval tahap 1 berhasil.');
                    $resultText = '✅ <b>Approval Tahap 1 Berhasil</b> oleh ' . ($fromUser['first_name'] ?? 'Approver');
                } else {
                    match ($type) {
                        'leave' => app(LeaveApprovalService::class)->approve($requestModel, $approverUser),
                        'overtime' => $requestModel->update(['status' => 'approved', 'approved_by' => $approverUser->id, 'approved_at' => now()]),
                        'attendance' => $this->approveAttendance($requestModel, $approverUser),
                        'shift_change' => $requestModel->update(['status' => 'approved', 'approved_by' => $approverUser->id, 'approved_at' => now()]),
                    };
                    $this->bot->answerCallbackQuery($callbackId, 'Pengajuan berhasil disetujui!');
                    $resultText = '✅ <b>Pengajuan Disetujui Penuh</b> oleh ' . ($fromUser['first_name'] ?? 'Approver');
                    $this->notificationService->notifyEmployeeRequestStatus($type, $requestModel, 'approved');
                }
            } else {
                $this->workflowService->reject($requestModel, $approverUser, 'Ditolak via Telegram');
                $this->bot->answerCallbackQuery($callbackId, 'Pengajuan ditolak.');
                $resultText = '❌ <b>Pengajuan Ditolak</b> oleh ' . ($fromUser['first_name'] ?? 'Approver');
                $this->notificationService->notifyEmployeeRequestStatus($type, $requestModel, 'rejected', 'Ditolak via Telegram');
            }

            if ($fromChatId && $messageId) {
                $this->bot->editMessageText(
                    $fromChatId,
                    $messageId,
                    $callbackQuery['message']['text'] . "\n\n" . $resultText
                );
            }
        } catch (\Throwable $e) {
            $this->bot->answerCallbackQuery($callbackId, 'Gagal: ' . $e->getMessage(), true);
        }
    }

    private function approveAttendance(AttendanceCorrectionRequest $item, User $actor): void
    {
        $attendance = EmployeeAttendance::withoutGlobalScopes()->firstOrNew([
            'employee_id' => $item->employee_id,
            'attendance_date' => $item->attendance_date,
        ]);

        if ($item->clock_in_time) {
            $attendance->clock_in_at = Carbon::parse($item->attendance_date . ' ' . $item->clock_in_time);
        }
        if ($item->clock_out_time) {
            $attendance->clock_out_at = Carbon::parse($item->attendance_date . ' ' . $item->clock_out_time);
        }

        $attendance->status = 'present';
        $attendance->save();

        $item->update([
            'status' => 'approved',
            'approved_by' => $actor->id,
            'approved_at' => now(),
        ]);
    }
}
