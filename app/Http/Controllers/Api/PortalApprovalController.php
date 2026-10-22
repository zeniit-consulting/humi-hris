<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Models\AttendanceCorrectionRequest;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use App\Models\WorkShift;
use App\Models\EmployeeSchedule;
use App\Services\ApprovalWorkflowService;
use App\Services\LeaveApprovalService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalApprovalController extends Controller
{
    use InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        $employee = $this->employee($request->user());
        abort_unless($employee && app(ApprovalWorkflowService::class)->hasApprovalLine($employee), 404);

        $activeTz = $this->resolveActiveUserTimezone($request, $employee);
        $activeTzLabel = $this->timezoneLabel($activeTz);

        $attendanceRows = AttendanceCorrectionRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with(['employee:id,employee_code,first_name,last_name,timezone', 'shift:id,name,code,start_time,end_time'])
            ->latest()
            ->get()
            ->map(function ($row) use ($activeTz, $activeTzLabel) {
                $checkIn = $row->check_in_at
                    ? Carbon::parse($row->check_in_at, 'UTC')->setTimezone($activeTz)->format('H:i')
                    : null;
                $checkOut = $row->check_out_at
                    ? Carbon::parse($row->check_out_at, 'UTC')->setTimezone($activeTz)->format('H:i')
                    : null;

                if ($checkIn && $checkOut) {
                    $timeText = "{$checkIn} - {$checkOut} {$activeTzLabel}";
                } elseif ($checkIn) {
                    $timeText = "Clock In: {$checkIn} {$activeTzLabel}";
                } elseif ($checkOut) {
                    $timeText = "Clock Out: {$checkOut} {$activeTzLabel}";
                } else {
                    $timeText = '-';
                }

                $dateFormatted = $row->attendance_date ? Carbon::parse($row->attendance_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $createdAtFormatted = $row->created_at ? Carbon::parse($row->created_at)->setTimezone($activeTz)->locale('id')->isoFormat('D MMM Y, HH:mm') . ' ' . $activeTzLabel : null;

                return [
                    'id' => $row->id,
                    'type' => 'attendance',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $createdAtFormatted ?? $row->created_at?->toDateString(),
                    'created_at_raw' => $row->created_at?->timestamp ?? 0,
                    'title' => 'Koreksi Absensi (' . ($row->shift?->name ?? 'Shift') . ')',
                    'subtitle' => $dateFormatted . ' • ' . $timeText,
                    'reason' => $row->reason,
                    'badge' => $row->request_type === 'clock_out' ? 'Lupa Clock Out' : ($row->request_type === 'clock_in' ? 'Lupa Clock In' : 'Koreksi Absen'),
                ];
            });

        $leaveRows = LeaveRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with('employee:id,employee_code,first_name,last_name')
            ->latest()
            ->get()
            ->map(function ($row) use ($activeTz, $activeTzLabel) {
                $start = $row->start_date ? Carbon::parse($row->start_date)->locale('id')->isoFormat('D MMM') : '-';
                $end = $row->end_date ? Carbon::parse($row->end_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $days = (float) $row->total_days;
                $leaveTypeMap = [
                    'annual' => 'Cuti Tahunan',
                    'sick' => 'Izin Sakit',
                    'unpaid' => 'Izin Tidak Berbayar',
                    'other' => 'Izin / Cuti Khusus',
                ];
                $createdAtFormatted = $row->created_at ? Carbon::parse($row->created_at)->setTimezone($activeTz)->locale('id')->isoFormat('D MMM Y, HH:mm') . ' ' . $activeTzLabel : null;

                return [
                    'id' => $row->id,
                    'type' => 'leave',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $createdAtFormatted ?? $row->created_at?->toDateString(),
                    'created_at_raw' => $row->created_at?->timestamp ?? 0,
                    'title' => $leaveTypeMap[$row->leave_type] ?? 'Pengajuan Cuti',
                    'subtitle' => ($start === $end ? $start : $start . ' - ' . $end) . ' (' . $days . ' hari)',
                    'reason' => $row->reason,
                    'attachment' => $row->attachment ? asset('storage/' . $row->attachment) : null,
                    'attachment_name' => $row->attachment_name,
                    'badge' => $leaveTypeMap[$row->leave_type] ?? ucfirst((string) $row->leave_type),
                ];
            });

        $overtimeRows = OvertimeRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with('employee:id,employee_code,first_name,last_name,timezone')
            ->latest()
            ->get()
            ->map(function ($row) use ($activeTz, $activeTzLabel) {
                $requesterTz = is_string($row->employee?->timezone) && in_array($row->employee?->timezone, timezone_identifiers_list(), true) && $row->employee->timezone !== 'UTC'
                    ? $row->employee->timezone
                    : $activeTz;

                $dateFormatted = $row->work_date ? Carbon::parse($row->work_date)->locale('id')->isoFormat('D MMM Y') : '-';
                $hours = (float) $row->total_hours;

                $start = $row->start_time ? substr((string) $row->start_time, 0, 5) : '-';
                $end = $row->end_time ? substr((string) $row->end_time, 0, 5) : '-';

                if ($requesterTz !== $activeTz && $row->work_date && $row->start_time && $row->end_time) {
                    $workDateStr = Carbon::parse($row->work_date)->toDateString();
                    $start = Carbon::parse($workDateStr . ' ' . $start, $requesterTz)->setTimezone($activeTz)->format('H:i');
                    $end = Carbon::parse($workDateStr . ' ' . $end, $requesterTz)->setTimezone($activeTz)->format('H:i');
                }

                $createdAtFormatted = $row->created_at ? Carbon::parse($row->created_at)->setTimezone($activeTz)->locale('id')->isoFormat('D MMM Y, HH:mm') . ' ' . $activeTzLabel : null;

                return [
                    'id' => $row->id,
                    'type' => 'overtime',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $createdAtFormatted ?? $row->created_at?->toDateString(),
                    'created_at_raw' => $row->created_at?->timestamp ?? 0,
                    'title' => $row->is_event ? 'Lembur Event: ' . ($row->event_name ?? 'Kegiatan Khusus') : 'Lembur Reguler',
                    'subtitle' => $dateFormatted . ' • ' . $start . ' - ' . $end . ' ' . $activeTzLabel . ' (' . $hours . ' jam)',
                    'reason' => $row->reason,
                    'badge' => $row->is_event ? 'Event' : 'Lembur',
                ];
            });

        $shiftRows = ShiftChangeRequest::query()
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('approval_stage', 0)->where('first_approver_employee_id', $employee->id)->orWhere('approval_stage', 1)->where('second_approver_employee_id', $employee->id))
            ->with(['employee:id,employee_code,first_name,last_name,timezone', 'currentShift:id,name,code,start_time,end_time', 'requestedShift:id,name,code,start_time,end_time'])
            ->latest()
            ->get()
            ->map(function ($row) use ($activeTz, $activeTzLabel) {
                $requesterTz = is_string($row->employee?->timezone) && in_array($row->employee?->timezone, timezone_identifiers_list(), true) && $row->employee->timezone !== 'UTC'
                    ? $row->employee->timezone
                    : $activeTz;

                $dateFormatted = $row->requested_date ? Carbon::parse($row->requested_date)->locale('id')->isoFormat('D MMM Y') : '-';

                $formatShiftTime = function ($shift) use ($requesterTz, $activeTz, $activeTzLabel, $row) {
                    if (! $shift?->start_time || ! $shift?->end_time) {
                        return '';
                    }
                    $s = substr((string) $shift->start_time, 0, 5);
                    $e = substr((string) $shift->end_time, 0, 5);
                    if ($requesterTz !== $activeTz && $row->requested_date) {
                        $d = Carbon::parse($row->requested_date)->toDateString();
                        $s = Carbon::parse($d . ' ' . $s, $requesterTz)->setTimezone($activeTz)->format('H:i');
                        $e = Carbon::parse($d . ' ' . $e, $requesterTz)->setTimezone($activeTz)->format('H:i');
                    }
                    return ' (' . $s . '-' . $e . ' ' . $activeTzLabel . ')';
                };

                $fromTime = $formatShiftTime($row->currentShift);
                $toTime = $formatShiftTime($row->requestedShift);
                $fromShift = ($row->currentShift?->name ?? 'Shift Awal') . $fromTime;
                $toShift = ($row->requestedShift?->name ?? 'Shift Baru') . $toTime;
                $createdAtFormatted = $row->created_at ? Carbon::parse($row->created_at)->setTimezone($activeTz)->locale('id')->isoFormat('D MMM Y, HH:mm') . ' ' . $activeTzLabel : null;

                return [
                    'id' => $row->id,
                    'type' => 'shift_change',
                    'employee_label' => $row->employee?->employee_code . ' - ' . $row->employee?->full_name,
                    'stage' => $row->approval_stage + 1,
                    'created_at' => $createdAtFormatted ?? $row->created_at?->toDateString(),
                    'created_at_raw' => $row->created_at?->timestamp ?? 0,
                    'title' => 'Tukar Shift: ' . $fromShift . ' → ' . $toShift,
                    'subtitle' => 'Tanggal: ' . $dateFormatted,
                    'reason' => $row->reason,
                    'badge' => 'Tukar Shift',
                ];
            });

        $items = $attendanceRows
            ->concat($leaveRows)
            ->concat($overtimeRows)
            ->concat($shiftRows)
            ->sortByDesc('created_at_raw')
            ->values()
            ->map(function ($item) {
                unset($item['created_at_raw']);
                return $item;
            });

        return response()->json(['data' => ['items' => $items]]);
    }
    public function approve(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->requestFor($type, $id); $actor = $request->user();
        $result = app(ApprovalWorkflowService::class)->approve($model, $actor);
        if ($result === ApprovalWorkflowService::ADVANCED) return response()->json(['message' => 'Approval tahap 1 berhasil.']);
        match ($type) {
            'leave' => app(LeaveApprovalService::class)->approve($model, $actor),
            'overtime' => $model->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now(), 'notes' => null]),
            'attendance' => $this->approveAttendance($model, $actor),
            'shift_change' => $this->approveShift($model, $actor),
        };
        app(\App\Services\TelegramNotificationService::class)->notifyEmployeeRequestStatus($type, $model, 'approved');
        return response()->json(['message' => 'Request disetujui.']);
    }
    public function reject(Request $request, string $type, int $id): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        $model = $this->requestFor($type, $id);
        app(ApprovalWorkflowService::class)->reject($model, $request->user(), $data['reason']);
        app(\App\Services\TelegramNotificationService::class)->notifyEmployeeRequestStatus($type, $model, 'rejected', $data['reason']);
        return response()->json(['message' => 'Request ditolak.']);
    }
    private function requestFor(string $type, int $id): AttendanceCorrectionRequest|LeaveRequest|OvertimeRequest|ShiftChangeRequest { return match ($type) { 'attendance' => AttendanceCorrectionRequest::findOrFail($id), 'leave' => LeaveRequest::findOrFail($id), 'overtime' => OvertimeRequest::findOrFail($id), 'shift_change' => ShiftChangeRequest::findOrFail($id), default => abort(404) }; }

    private function employee(User $user): ?Employee
    {
        return $this->resolveSelfServiceEmployee($user) ?? Employee::query()
            ->where(function ($query) use ($user) {
                if ($user->email && ! str_ends_with($user->email, '@local.portal')) {
                    $query->where('email', $user->email);
                }
                if ($user->phone) {
                    $user->email && ! str_ends_with($user->email, '@local.portal')
                        ? $query->orWhere('phone', $user->phone)
                        : $query->where('phone', $user->phone);
                }
            })
            ->first();
    }

    private function resolveActiveUserTimezone(Request $request, ?Employee $employee): string
    {
        // 1. Explicit timezone setting on the active approver's employee profile
        if ($employee && is_string($employee->timezone) && in_array($employee->timezone, timezone_identifiers_list(), true) && $employee->timezone !== 'UTC') {
            return $employee->timezone;
        }

        // 2. X-Timezone header sent by the client device
        $headerTz = $request->header('X-Timezone');
        if (is_string($headerTz) && in_array($headerTz, timezone_identifiers_list(), true) && $headerTz !== 'UTC') {
            return $headerTz;
        }

        // 3. Derive from assigned attendance location coordinates
        $ownerId = $request->user()?->accountOwnerId() ?? $request->user()?->id;
        if ($ownerId) {
            $setting = CompanySetting::query()->where('user_id', $ownerId)->first();
            if ($employee && ! empty($employee->attendance_location_ids) && $setting) {
                $locs = collect($setting->attendance_locations ?? []);
                $firstLocId = $employee->attendance_location_ids[0] ?? null;
                $loc = $locs->firstWhere('id', $firstLocId);
                if ($loc && isset($loc['longitude'])) {
                    $lng = (float) $loc['longitude'];
                    if ($lng >= 125.0) {
                        return 'Asia/Jayapura';
                    }
                    if ($lng >= 114.5) {
                        return 'Asia/Makassar';
                    }
                    return 'Asia/Jakarta';
                }
            }

            // 4. Derive from company headquarters location coordinates
            if ($setting && $setting->location_longitude) {
                $lng = (float) $setting->location_longitude;
                if ($lng >= 125.0) {
                    return 'Asia/Jayapura';
                }
                if ($lng >= 114.5) {
                    return 'Asia/Makassar';
                }
                return 'Asia/Jakarta';
            }
        }

        // 5. Default Indonesian timezone
        return 'Asia/Jakarta';
    }

    private function timezoneLabel(string $tz): string
    {
        return match ($tz) {
            'Asia/Jakarta', 'Asia/Pontianak' => 'WIB',
            'Asia/Makassar', 'Asia/Ujung_Pandang' => 'WITA',
            'Asia/Jayapura' => 'WIT',
            default => 'WIB',
        };
    }
    private function approveAttendance(AttendanceCorrectionRequest $item, User $actor): void
    {
        $attendance = EmployeeAttendance::query()->firstOrNew([
            'employee_id' => $item->employee_id,
            'attendance_date' => $item->attendance_date,
        ]);

        $attendance->fill([
            'user_id' => $item->user_id,
            'shift_id' => $item->shift_id ?? $attendance->shift_id,
            'status' => 'present',
            'check_in_at' => $item->check_in_at ?? $attendance->check_in_at,
            'check_out_at' => $item->check_out_at ?? $attendance->check_out_at,
        ]);
        $attendance->save();
        app(\App\Services\AutoOvertimeService::class)->syncFromAttendance($attendance, (int) $item->user_id);

        $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]);
    }
    private function approveShift(ShiftChangeRequest $item, User $actor): void { $shift = WorkShift::findOrFail($item->requested_shift_id); EmployeeSchedule::query()->updateOrCreate(['employee_id' => $item->employee_id, 'work_date' => $item->requested_date], ['user_id' => $item->user_id, 'shift_code' => $shift->code, 'start_time' => $shift->start_time, 'end_time' => $shift->end_time, 'is_day_off' => $shift->is_day_off, 'is_wfa' => (bool) $shift->is_wfa]); $item->update(['status' => 'approved', 'approved_by' => $actor->id, 'approved_at' => now()]); }
}
