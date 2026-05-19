<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\CompanyAssetAssignment;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeLeaveBalance;
use App\Models\EmployeeSchedule;
use App\Models\EmployeeSurvey;
use App\Models\EmployeeSurveyResponse;
use App\Models\LeaveRequest;
use App\Models\NotificationAnnouncement;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\SubCompanyAttendanceLocation;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PortalController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $timezone = $this->deviceTimezone($request);

        $today = Carbon::today($timezone);
        $period = $today->format('Y-m');
        $employee = $this->resolveSelfServiceEmployee($user);

        $todayAttendance = null;
        $openAttendance = null;
        $annualLeaveDays = 0.0;
        $sickLeaveDays = 0.0;
        $availableShifts = collect();
        $todayShift = null;
        $upcomingLeaves = collect();
        $todayOvertimes = collect();
        $payrollRun = null;
        $payrollItem = null;
        $announcements = collect();
        $pendingSurveys = collect();
        $assignedAssets = collect();
        $companySetting = CompanySetting::query()
            ->where('user_id', $user->accountOwnerId())
            ->first();

        if ($employee) {
            $todayAttendance = EmployeeAttendance::query()
                ->with(['shift:id,code,name,start_time,end_time,is_day_off'])
                ->where('employee_id', $employee->id)
                ->whereDate('attendance_date', $today->toDateString())
                ->first();

            $openAttendance = EmployeeAttendance::query()
                ->with(['shift:id,code,name,start_time,end_time,is_day_off'])
                ->where('employee_id', $employee->id)
                ->whereNull('check_out_at')
                ->whereDate('attendance_date', '>=', $today->copy()->subDays(3)->toDateString())
                ->orderByDesc('attendance_date')
                ->orderByDesc('id')
                ->first();

            $todayShift = EmployeeSchedule::query()
                ->with(['employee:id,employee_code,first_name,last_name'])
                ->where('employee_id', $employee->id)
                ->whereDate('work_date', $today->toDateString())
                ->first();

            $availableShifts = WorkShift::query()
                ->where('user_id', $user->accountOwnerId())
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'start_time', 'end_time', 'is_day_off']);

            $todayShiftOption = $todayShift?->shift_code
                ? $availableShifts->firstWhere('code', $todayShift->shift_code)
                : null;

            $annualLeaveBalance = EmployeeLeaveBalance::query()
                ->where('employee_id', $employee->id)
                ->where('leave_type', 'annual')
                ->where('year', $today->year)
                ->first();

            $sickLeaveBalance = EmployeeLeaveBalance::query()
                ->where('employee_id', $employee->id)
                ->where('leave_type', 'sick')
                ->where('year', $today->year)
                ->first();

            $annualLeaveDays = $annualLeaveBalance?->remainingBalance() ?? 0.0;
            $sickLeaveDays = $sickLeaveBalance?->remainingBalance() ?? 0.0;

            $upcomingLeaves = LeaveRequest::query()
                ->where('employee_id', $employee->id)
                ->whereIn('status', ['pending', 'approved'])
                ->whereDate('end_date', '>=', $today->toDateString())
                ->whereDate('start_date', '<=', $today->copy()->addDays(7)->toDateString())
                ->orderBy('start_date')
                ->limit(3)
                ->get();

            $todayOvertimes = OvertimeRequest::query()
                ->where('employee_id', $employee->id)
                ->whereDate('work_date', $today->toDateString())
                ->orderBy('start_time')
                ->limit(2)
                ->get();

            $payrollRun = PayrollRun::query()
                ->with([
                    'items' => fn ($query) => $query
                        ->where('employee_id', $employee->id)
                        ->with('employee:id,employee_code,first_name,last_name'),
                ])
                ->where('period', $period)
                ->first();

            $payrollItem = $payrollRun?->items?->first();

            $announcements = NotificationAnnouncement::query()
                ->where('status', 'published')
                ->where('channel', 'portal')
                ->where(function ($query) use ($employee): void {
                    $query->where('audience', 'all');

                    if ($employee->is_active) {
                        $query->orWhere('audience', 'active_employees');
                    } else {
                        $query->orWhere('audience', 'inactive_employees');
                    }
                })
                ->where(function ($query) use ($today): void {
                    $query->whereNull('publish_at')
                        ->orWhere('publish_at', '<=', $today->copy()->endOfDay());
                })
                ->where(function ($query) use ($today): void {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>=', $today->copy()->startOfDay());
                })
                ->latest('publish_at')
                ->latest('id')
                ->limit(3)
                ->get();

            $pendingSurveys = EmployeeSurvey::query()
                ->where('status', 'active')
                ->where(function ($query) use ($today): void {
                    $query->whereNull('starts_at')
                        ->orWhere('starts_at', '<=', $today->copy()->endOfDay());
                })
                ->where(function ($query) use ($today): void {
                    $query->whereNull('ends_at')
                        ->orWhere('ends_at', '>=', $today->copy()->startOfDay());
                })
                ->latest('starts_at')
                ->latest('id')
                ->get()
                ->reject(function (EmployeeSurvey $survey) use ($employee): bool {
                    if ($survey->is_anonymous) {
                        return false;
                    }

                    return EmployeeSurveyResponse::query()
                        ->where('employee_survey_id', $survey->id)
                        ->where('employee_id', $employee->id)
                        ->exists();
                })
                ->take(2)
                ->values();

            $assignedAssets = CompanyAssetAssignment::query()
                ->with('asset:id,name,asset_code,category')
                ->where('employee_id', $employee->id)
                ->whereNull('returned_at')
                ->latest('issued_at')
                ->latest('id')
                ->limit(2)
                ->get();
        }

        $timeline = collect();

        if ($employee) {
            if ($todayAttendance) {
                $timeline->push([
                    'id' => 'attendance-'.$todayAttendance->id,
                    'type' => 'attendance',
                    'date' => $today->toDateString(),
                    'month_label' => strtoupper($today->translatedFormat('M')),
                    'day_label' => $today->format('d'),
                    'title' => match ($todayAttendance->status) {
                        'late' => 'Absensi tercatat terlambat',
                        'on_leave' => 'Sedang cuti hari ini',
                        'absent' => 'Absensi tercatat alpa',
                        default => 'Absensi tercatat',
                    },
                    'subtitle' => trim(implode(' • ', array_filter([
                        $todayAttendance->check_in_at ? 'Masuk '.$todayAttendance->check_in_at->copy()->setTimezone($timezone)->format('H:i') : null,
                        $todayAttendance->check_out_at ? 'Pulang '.$todayAttendance->check_out_at->copy()->setTimezone($timezone)->format('H:i') : 'Masih aktif',
                    ]))),
                    'chip' => $todayAttendance->status,
                ]);
            } else {
                $timeline->push([
                    'id' => 'attendance-pending-'.$today->toDateString(),
                    'type' => 'attendance_pending',
                    'date' => $today->toDateString(),
                    'month_label' => strtoupper($today->translatedFormat('M')),
                    'day_label' => $today->format('d'),
                    'title' => 'Absensi shift belum dibuat',
                    'subtitle' => 'Clock in masih tersedia hari ini.',
                    'chip' => 'pending',
                ]);
            }
        }

        foreach ($upcomingLeaves as $leave) {
            $startDate = Carbon::parse($leave->start_date);

            $timeline->push([
                'id' => 'leave-'.$leave->id,
                'type' => 'leave',
                'date' => $startDate->toDateString(),
                'month_label' => strtoupper($startDate->translatedFormat('M')),
                'day_label' => $startDate->format('d'),
                'title' => ucfirst($leave->leave_type).' cuti',
                'subtitle' => sprintf(
                    '%s sampai %s',
                    $startDate->translatedFormat('d M'),
                    Carbon::parse($leave->end_date)->translatedFormat('d M')
                ),
                'chip' => $leave->status,
            ]);
        }

        foreach ($todayOvertimes as $overtime) {
            $timeline->push([
                'id' => 'overtime-'.$overtime->id,
                'type' => 'overtime',
                'date' => $today->toDateString(),
                'month_label' => strtoupper($today->translatedFormat('M')),
                'day_label' => $today->format('d'),
                'title' => 'Pengajuan lembur',
                'subtitle' => sprintf(
                    '%s - %s • %s jam',
                    Carbon::parse($overtime->start_time)->format('H:i'),
                    Carbon::parse($overtime->end_time)->format('H:i'),
                    rtrim(rtrim(number_format((float) $overtime->total_hours, 2, '.', ''), '0'), '.')
                ),
                'chip' => $overtime->status,
            ]);
        }

        if ($payrollRun && $payrollItem) {
            $timeline->push([
                'id' => 'payroll-'.$payrollRun->id,
                'type' => 'payroll',
                'date' => $payrollRun->period_end?->toDateString() ?? $today->toDateString(),
                'month_label' => strtoupper(Carbon::parse($payrollRun->period_start ?? $today)->translatedFormat('M')),
                'day_label' => Carbon::parse($payrollRun->period_end ?? $today)->format('d'),
                'title' => 'Pratinjau payroll siap',
                'subtitle' => sprintf(
                    '%s • %s',
                    $period,
                    $payrollRun->is_saved ? 'Tersimpan' : 'Draf'
                ),
                'chip' => $payrollRun->is_saved ? 'saved' : 'draft',
            ]);
        }

        return $this->success([
            'user' => $this->userPayload($user),
            'today' => [
                'date' => $today->toDateString(),
                'formatted' => $today->locale('id')->translatedFormat('l, d F'),
            ],
            'employee' => $employee ? [
                'id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'employment_status' => $employee->employment_status,
                'employment_type' => $employee->employment_type,
                'division' => $employee->division ? [
                    'id' => $employee->division->id,
                    'name' => $employee->division->name,
                ] : null,
                'position' => $employee->position ? [
                    'id' => $employee->position->id,
                    'name' => $employee->position->name,
                ] : null,
            ] : null,
            'quick_action' => [
                'shift' => $todayShift ? [
                    'id' => $todayShiftOption?->id ?? $todayShift->id,
                    'code' => $todayShiftOption?->code ?? $todayShift->shift_code,
                    'name' => $todayShiftOption?->name ?? $todayShift->shift_code,
                    'start_time' => $todayShiftOption?->start_time ?? $todayShift->start_time,
                    'end_time' => $todayShiftOption?->end_time ?? $todayShift->end_time,
                    'is_day_off' => $todayShiftOption?->is_day_off ?? $todayShift->is_day_off,
                ] : null,
                'attendance' => $todayAttendance ? [
                    'id' => $todayAttendance->id,
                    'attendance_date' => $todayAttendance->attendance_date?->format('Y-m-d'),
                    'status' => $todayAttendance->status,
                    'shift' => $todayAttendance->shift ? [
                        'id' => $todayAttendance->shift->id,
                        'code' => $todayAttendance->shift->code,
                        'name' => $todayAttendance->shift->name,
                        'start_time' => $todayAttendance->shift->start_time,
                        'end_time' => $todayAttendance->shift->end_time,
                        'is_day_off' => $todayAttendance->shift->is_day_off,
                    ] : null,
                    'check_in_at' => $todayAttendance->check_in_at?->copy()->setTimezone($timezone)->toIso8601String(),
                    'check_out_at' => $todayAttendance->check_out_at?->copy()->setTimezone($timezone)->toIso8601String(),
                    'notes' => $todayAttendance->notes,
                ] : null,
                'open_attendance' => $openAttendance ? [
                    'id' => $openAttendance->id,
                    'attendance_date' => $openAttendance->attendance_date?->format('Y-m-d'),
                    'status' => $openAttendance->status,
                    'shift' => $openAttendance->shift ? [
                        'id' => $openAttendance->shift->id,
                        'code' => $openAttendance->shift->code,
                        'name' => $openAttendance->shift->name,
                        'start_time' => $openAttendance->shift->start_time,
                        'end_time' => $openAttendance->shift->end_time,
                        'is_day_off' => $openAttendance->shift->is_day_off,
                    ] : null,
                    'check_in_at' => $openAttendance->check_in_at?->toIso8601String(),
                    'check_out_at' => $openAttendance->check_out_at?->toIso8601String(),
                    'check_in_latitude' => $openAttendance->check_in_latitude,
                    'check_in_longitude' => $openAttendance->check_in_longitude,
                    'check_out_latitude' => $openAttendance->check_out_latitude,
                    'check_out_longitude' => $openAttendance->check_out_longitude,
                    'notes' => $openAttendance->notes,
                ] : null,
                'can_clock_in' => $employee !== null && $openAttendance === null && $todayAttendance === null,
                'can_clock_out' => $openAttendance !== null,
                'hint' => $employee
                    ? ($openAttendance
                        ? 'Masih ada absensi yang belum pulang.'
                        : ($todayAttendance
                            ? ($todayAttendance->check_out_at
                                ? 'Absensi hari ini sudah selesai.'
                                : 'Pulang tersedia setelah shift selesai.')
                            : 'Belum ada absensi yang tercatat untuk hari ini.'))
                    : 'Tidak ada profil karyawan yang cocok dengan email akun ini.',
            ],
            'cards' => [
                'annual_leave_days' => $annualLeaveDays,
                'sick_leave_days' => $sickLeaveDays,
                'pending_surveys' => $pendingSurveys->count(),
                'assigned_assets' => $assignedAssets->count(),
                'payroll_preview' => [
                    'period' => $period,
                    'is_saved' => $payrollRun?->is_saved ?? false,
                    'generated_at' => $payrollRun?->generated_at?->setTimezone($timezone)->toIso8601String(),
                    'net_salary' => $payrollItem?->net_salary,
                ],
            ],
            'announcements' => $announcements->map(fn (NotificationAnnouncement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'message' => $announcement->message,
                'publish_at' => $announcement->publish_at?->setTimezone($timezone)->toIso8601String(),
            ])->values(),
            'surveys' => $pendingSurveys->map(fn (EmployeeSurvey $survey) => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'is_anonymous' => (bool) $survey->is_anonymous,
                'questions_count' => count($survey->questions ?? []),
                'ends_at' => $survey->ends_at?->setTimezone($timezone)->toIso8601String(),
            ])->values(),
            'assets' => $assignedAssets->map(fn (CompanyAssetAssignment $assignment) => [
                'id' => $assignment->id,
                'asset_code' => $assignment->asset?->asset_code,
                'name' => $assignment->asset?->name ?? 'Aset perusahaan',
                'category' => $assignment->asset?->category,
                'issued_at' => $assignment->issued_at?->format('Y-m-d'),
                'condition_out' => $assignment->condition_out,
            ])->values(),
            'attendance_policy' => [
                'radius_meters' => (int) ($companySetting?->attendance_radius_meters ?? 100),
                'primary_location' => $companySetting?->location_latitude !== null && $companySetting?->location_longitude !== null ? [
                    'name' => $companySetting->location_name ?: 'Lokasi utama',
                    'address' => $companySetting->location_address,
                    'latitude' => (float) $companySetting->location_latitude,
                    'longitude' => (float) $companySetting->location_longitude,
                    'radius_meters' => (int) ($companySetting->attendance_radius_meters ?? 100),
                ] : null,
                'locations' => $this->attendanceLocationsForEmployee($employee, $companySetting),
            ],
            'shift_options' => $availableShifts->map(fn (WorkShift $shift) => [
                'id' => $shift->id,
                'code' => $shift->code,
                'name' => $shift->name,
                'start_time' => $shift->start_time,
                'end_time' => $shift->end_time,
                'is_day_off' => $shift->is_day_off,
            ])->values(),
            'timeline' => $timeline
                ->sortBy('date')
                ->take(6)
                ->values(),
            'links' => [
                'attendance' => route('portal.attendance'),
                'schedules' => route('portal.attendance'),
                'leaves' => route('portal.leaves'),
                'overtimes' => route('portal.overtimes'),
                'kasbons' => route('portal.kasbons'),
                'payroll' => route('portal.payroll'),
                'profile' => route('portal.profile'),
                'dashboard' => route('portal.index'),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'parent_user_id' => $user->parent_user_id,
            'account_owner_id' => $user->accountOwnerId(),
            'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
            'created_at' => $user->created_at?->toDateTimeString(),
        ];
    }

    private function deviceTimezone(Request $request): string
    {
        $timezone = (string) $request->header('X-Timezone', config('app.timezone'));

        return in_array($timezone, timezone_identifiers_list(), true)
            ? $timezone
            : config('app.timezone');
    }

    private function attendanceLocationsForEmployee(?Employee $employee, ?CompanySetting $companySetting): \Illuminate\Support\Collection
    {
        if ($employee?->sub_company_id !== null) {
            return SubCompanyAttendanceLocation::query()
                ->where('user_id', $employee->user_id)
                ->where('sub_company_id', $employee->sub_company_id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (SubCompanyAttendanceLocation $location) => [
                    'name' => $location->name,
                    'address' => $location->address,
                    'latitude' => (float) $location->latitude,
                    'longitude' => (float) $location->longitude,
                    'radius_meters' => $location->radius_meters,
                ])
                ->values();
        }

        return collect($companySetting?->attendance_locations ?? [])
            ->map(fn (array $location) => [
                'name' => $location['name'] ?? 'Lokasi absensi',
                'address' => $location['address'] ?? null,
                'latitude' => isset($location['latitude']) ? (float) $location['latitude'] : null,
                'longitude' => isset($location['longitude']) ? (float) $location['longitude'] : null,
                'radius_meters' => (int) ($location['radius_meters'] ?? ($companySetting?->attendance_radius_meters ?? 100)),
            ])
            ->filter(fn (array $location) => $location['latitude'] !== null && $location['longitude'] !== null)
            ->values();
    }
}
