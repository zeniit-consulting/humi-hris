<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDeduction;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\AttendanceStatusService;
use App\Services\PayrollGenerationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class September2026PayrollTestingSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::query()->first();
        if (! $owner) {
            $this->command?->error('No owner user found.');
            return;
        }

        $ownerId = $owner->id;
        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();
        if ($setting) {
            $setting->update([
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi 15 Menit'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 Menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 Menit'],
                ],
                'late_half_day_enabled' => true,
                'late_half_day_cutoff_minutes' => 60,
                'late_half_day_penalty_type' => 'prorate_half_day',
                'active_working_days' => 22,
            ]);
        }

        $employees = Employee::query()
            ->where('user_id', $ownerId)
            ->where('is_active', true)
            ->where('employment_status', '!=', 'resigned')
            ->get();

        if ($employees->isEmpty()) {
            $this->command?->error('No active employees found.');
            return;
        }

        $shift = WorkShift::query()
            ->where('user_id', $ownerId)
            ->where('code', '0817')
            ->first() ?? WorkShift::query()->where('user_id', $ownerId)->where('is_day_off', false)->first();

        $startDate = Carbon::parse('2026-08-25');
        $endDate = Carbon::parse('2026-09-30');

        // 1. Ensure Employee Schedules exist
        $scheduleRows = [];
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $isWeekend = $date->isWeekend();
            $dateStr = $date->toDateString();

            foreach ($employees as $employee) {
                $scheduleRows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $employee->id,
                    'work_date' => $dateStr,
                    'shift_code' => $isWeekend ? 'OFF' : ($shift?->code ?? '0817'),
                    'start_time' => $isWeekend ? null : ($shift?->start_time ?? '08:00:00'),
                    'end_time' => $isWeekend ? null : ($shift?->end_time ?? '17:00:00'),
                    'is_day_off' => $isWeekend,
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($scheduleRows, 200) as $chunk) {
            EmployeeSchedule::query()->upsert(
                $chunk,
                ['user_id', 'employee_id', 'work_date'],
                ['shift_code', 'start_time', 'end_time', 'is_day_off', 'updated_at']
            );
        }

        // 2. Clear old test data for Sept 2026 range
        LeaveRequest::query()
            ->where('user_id', $ownerId)
            ->whereDate('start_date', '<=', $endDate->toDateString())
            ->whereDate('end_date', '>=', $startDate->toDateString())
            ->delete();

        EmployeeAttendance::query()
            ->where('user_id', $ownerId)
            ->whereBetween('attendance_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->delete();

        OvertimeRequest::query()
            ->where('user_id', $ownerId)
            ->whereBetween('work_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->delete();

        EmployeeDeduction::query()
            ->where('user_id', $ownerId)
            ->whereBetween('deduction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->delete();

        // 3. Create Leave Requests (Cuti)
        $leaveData = [
            // Cuti Tahunan (Paid)
            [
                'employee_id' => $employees->firstWhere('id', 1)?->id ?? $employees[0]->id,
                'leave_type' => 'annual',
                'start_date' => '2026-09-08',
                'end_date' => '2026-09-09',
                'total_days' => 2,
                'reason' => 'Cuti Tahunan - Liburan Keluarga',
                'status' => 'approved',
            ],
            [
                'employee_id' => $employees->firstWhere('id', 7)?->id ?? $employees->skip(6)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'annual',
                'start_date' => '2026-09-17',
                'end_date' => '2026-09-18',
                'total_days' => 2,
                'reason' => 'Cuti Tahunan - Acara Keluarga',
                'status' => 'approved',
            ],
            [
                'employee_id' => $employees->firstWhere('id', 12)?->id ?? $employees->skip(10)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'annual',
                'start_date' => '2026-09-04',
                'end_date' => '2026-09-04',
                'total_days' => 1,
                'reason' => 'Cuti Tahunan - Urusan Pribadi',
                'status' => 'approved',
            ],
            // Cuti Sakit (Paid)
            [
                'employee_id' => $employees->firstWhere('id', 3)?->id ?? $employees->skip(2)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'sick',
                'start_date' => '2026-09-14',
                'end_date' => '2026-09-15',
                'total_days' => 2,
                'reason' => 'Sakit Demam (Surat Dokter)',
                'status' => 'approved',
            ],
            [
                'employee_id' => $employees->firstWhere('id', 10)?->id ?? $employees->skip(8)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'sick',
                'start_date' => '2026-09-21',
                'end_date' => '2026-09-21',
                'total_days' => 1,
                'reason' => 'Sakit Flu',
                'status' => 'approved',
            ],
            // Cuti Khusus / Menikah (Paid)
            [
                'employee_id' => $employees->firstWhere('id', 13)?->id ?? $employees->skip(11)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'special',
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-03',
                'total_days' => 3,
                'reason' => 'Cuti Menikah',
                'status' => 'approved',
            ],
            // Cuti Tanpa Gaji (Unpaid Leave - Potong Gaji Prorata Harian di Payroll)
            [
                'employee_id' => $employees->firstWhere('id', 2)?->id ?? $employees[1]->id,
                'leave_type' => 'unpaid',
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-11',
                'total_days' => 2,
                'reason' => 'Cuti Tanpa Gaji (Unpaid) - Keperluan Pribadi',
                'status' => 'approved',
            ],
            [
                'employee_id' => $employees->firstWhere('id', 8)?->id ?? $employees->skip(7)->first()?->id ?? $employees[0]->id,
                'leave_type' => 'unpaid',
                'start_date' => '2026-09-22',
                'end_date' => '2026-09-22',
                'total_days' => 1,
                'reason' => 'Cuti Tanpa Gaji (Unpaid) - Keperluan Keluarga Luar Kota',
                'status' => 'approved',
            ],
        ];

        $approvedLeavesMap = [];
        foreach ($leaveData as $item) {
            $created = LeaveRequest::query()->create([
                'user_id' => $ownerId,
                'employee_id' => $item['employee_id'],
                'leave_type' => $item['leave_type'],
                'start_date' => $item['start_date'],
                'end_date' => $item['end_date'],
                'total_days' => $item['total_days'],
                'reason' => $item['reason'],
                'status' => $item['status'],
                'approved_at' => now(),
                'approved_by' => $ownerId,
            ]);

            $cStart = Carbon::parse($item['start_date']);
            $cEnd = Carbon::parse($item['end_date']);
            for ($d = $cStart->copy(); $d->lte($cEnd); $d->addDay()) {
                $approvedLeavesMap[$item['employee_id']][$d->toDateString()] = $item['reason'];
            }
        }

        // 4. Create Overtime Requests
        OvertimeRequest::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employees->firstWhere('id', 1)?->id ?? $employees[0]->id,
            'work_date' => '2026-09-07',
            'start_time' => '17:00:00',
            'end_time' => '20:00:00',
            'break_minutes' => 0,
            'total_hours' => 3.0,
            'reason' => 'Project Deployment & Backup',
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $ownerId,
        ]);

        OvertimeRequest::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employees->firstWhere('id', 10)?->id ?? $employees->skip(8)->first()?->id ?? $employees[0]->id,
            'work_date' => '2026-09-18',
            'start_time' => '17:00:00',
            'end_time' => '19:00:00',
            'break_minutes' => 0,
            'total_hours' => 2.0,
            'reason' => 'Closing Monthly Data',
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $ownerId,
        ]);

        // 5. Create Kasbon & Other Deductions
        EmployeeDeduction::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employees->firstWhere('id', 5)?->id ?? $employees[0]->id,
            'type' => 'kasbon',
            'amount' => 500000,
            'deduction_date' => '2026-09-10',
            'notes' => 'Kasbon cicilan September',
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employees->firstWhere('id', 9)?->id ?? $employees[0]->id,
            'type' => 'denda',
            'amount' => 150000,
            'deduction_date' => '2026-09-15',
            'notes' => 'Denda Operasional & Disiplin',
        ]);

        // 6. Create Attendances
        $emp1Id = $employees->firstWhere('id', 1)?->id ?? $employees[0]->id;
        $emp2Id = $employees->firstWhere('id', 2)?->id ?? $employees[1]->id;
        $emp3Id = $employees->firstWhere('id', 3)?->id ?? $employees[2]->id;
        $emp5Id = $employees->firstWhere('id', 5)?->id ?? $employees[3]->id;
        $emp9Id = $employees->firstWhere('id', 9)?->id ?? $employees[4]->id;
        $emp11Id = $employees->firstWhere('id', 11)?->id ?? $employees[5]->id;
        $emp15Id = $employees->firstWhere('id', 15)?->id ?? $employees[6]->id;
        $emp17Id = $employees->firstWhere('id', 17)?->id ?? $employees[7]->id;

        $attendanceRows = [];
        $statusService = app(AttendanceStatusService::class);

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            if ($date->isWeekend()) {
                continue;
            }

            $dateStr = $date->toDateString();

            foreach ($employees as $employee) {
                // If employee is on approved leave
                if (isset($approvedLeavesMap[$employee->id][$dateStr])) {
                    $attendanceRows[] = [
                        'user_id' => $ownerId,
                        'employee_id' => $employee->id,
                        'shift_id' => $shift?->id,
                        'attendance_date' => $dateStr,
                        'status' => 'on_leave',
                        'late_minutes' => null,
                        'late_level' => null,
                        'late_penalty' => 0.00,
                        'is_half_day' => false,
                        'check_in_at' => null,
                        'check_out_at' => null,
                        'notes' => $approvedLeavesMap[$employee->id][$dateStr],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    continue;
                }

                // Default: on time check-in (07:48 - 07:58), check-out (17:05 - 17:20)
                $inMin = random_int(48, 58);
                $outMin = random_int(5, 20);
                $checkInAt = Carbon::parse("{$dateStr} 07:{$inMin}:00");
                $checkOutAt = Carbon::parse("{$dateStr} 17:{$outMin}:00");
                $status = 'present';
                $lateMinutes = null;
                $lateLevel = null;
                $latePenalty = 0.00;
                $isHalfDay = false;
                $notes = null;

                // Specific testing scenarios:
                // Scenario 1: Employee 1 has 2x late (accumulation test: Rp 20k + Rp 50k = Rp 70k)
                if ($employee->id === $emp1Id && $dateStr === '2026-09-02') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:25:00");
                    $status = 'late';
                    $lateMinutes = 25;
                    $lateLevel = 'level_1';
                    $latePenalty = 20000.00;
                    $notes = 'Terlambat 25 menit (Tier 16-30 mnt)';
                } elseif ($employee->id === $emp1Id && $dateStr === '2026-09-16') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:45:00");
                    $status = 'late';
                    $lateMinutes = 45;
                    $lateLevel = 'level_2';
                    $latePenalty = 50000.00;
                    $notes = 'Terlambat 45 menit (Tier 31-60 mnt)';
                }
                // Scenario 2: Employee 3 late 48 min (Tier 3: Rp 50,000)
                elseif ($employee->id === $emp3Id && $dateStr === '2026-09-04') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:48:00");
                    $status = 'late';
                    $lateMinutes = 48;
                    $lateLevel = 'level_2';
                    $latePenalty = 50000.00;
                    $notes = 'Terlambat 48 menit';
                }
                // Scenario 3: Employee 5 late 12 min (Tolerance <= 15 min -> Rp 0)
                elseif ($employee->id === $emp5Id && $dateStr === '2026-09-03') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:12:00");
                    $status = 'present';
                    $lateMinutes = 12;
                    $latePenalty = 0.00;
                    $notes = 'Terlambat 12 menit (Dalam batas toleransi 15 mnt)';
                }
                // Scenario 4: Employee 9 late 20 min (Tier 2: Rp 20,000)
                elseif ($employee->id === $emp9Id && $dateStr === '2026-09-07') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:20:00");
                    $status = 'late';
                    $lateMinutes = 20;
                    $lateLevel = 'level_1';
                    $latePenalty = 20000.00;
                    $notes = 'Terlambat 20 menit';
                }
                // Scenario 5: Employee 11 late 40 min (Tier 3: Rp 50,000)
                elseif ($employee->id === $emp11Id && $dateStr === '2026-09-15') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:40:00");
                    $status = 'late';
                    $lateMinutes = 40;
                    $lateLevel = 'level_2';
                    $latePenalty = 50000.00;
                    $notes = 'Terlambat 40 menit';
                }
                // Scenario 6: Employee 15 late 75 min (Half-Day Prorate / Potong Prorata Harian 50%)
                elseif ($employee->id === $emp15Id && $dateStr === '2026-09-09') {
                    $checkInAt = Carbon::parse("{$dateStr} 09:15:00");
                    $status = 'late';
                    $lateMinutes = 75;
                    $lateLevel = 'half_day';
                    $isHalfDay = true;
                    $latePenalty = $statusService->calculateLatePenalty(75, true, $setting, $employee);
                    $notes = 'Terlambat 75 menit (Potong Prorata Harian 50%)';
                }
                // Scenario 7: Employee 17 late 90 min (Half-Day Prorate / Potong Prorata Harian 50%)
                elseif ($employee->id === $emp17Id && $dateStr === '2026-09-11') {
                    $checkInAt = Carbon::parse("{$dateStr} 09:30:00");
                    $status = 'late';
                    $lateMinutes = 90;
                    $lateLevel = 'half_day';
                    $isHalfDay = true;
                    $latePenalty = $statusService->calculateLatePenalty(90, true, $setting, $employee);
                    $notes = 'Terlambat 90 menit (Potong Prorata Harian 50%)';
                }

                $attendanceRows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $employee->id,
                    'shift_id' => $shift?->id,
                    'attendance_date' => $dateStr,
                    'status' => $status,
                    'late_minutes' => $lateMinutes,
                    'late_level' => $lateLevel,
                    'late_penalty' => round($latePenalty, 2),
                    'is_half_day' => $isHalfDay,
                    'check_in_at' => $checkInAt,
                    'check_out_at' => $checkOutAt,
                    'notes' => $notes,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($attendanceRows, 200) as $chunk) {
            EmployeeAttendance::query()->insert($chunk);
        }

        // 7. Auto generate/recalculate Payroll for September 2026
        app(PayrollGenerationService::class)->generateForPeriod(
            ownerId: $ownerId,
            period: '2026-09',
            generatedBy: $ownerId,
            markAsDraft: true,
        );

        $this->command?->info('Dummy data for September 2026 attendance, leave, overtime, and deductions created successfully!');
    }
}
