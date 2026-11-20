<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\PayrollGenerationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ThreeMonthsDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $targetEmail = env('SEED_USER_EMAIL');
        $targetUserId = env('SEED_USER_ID');

        $owner = null;
        if ($targetEmail) {
            $owner = User::where('email', $targetEmail)->first();
        } elseif ($targetUserId) {
            $owner = User::find($targetUserId);
        }

        if (! $owner) {
            $owner = User::find(1) ?? User::where('role', 'admin')->first() ?? User::first();
        }

        if (! $owner) {
            $this->command?->error('No user found.');
            return;
        }
        $ownerId = $owner->id;
        $this->command?->info("Generating dummy data for: {$owner->name} ({$owner->email}, ID: {$owner->id})");

        // 1. Get or create 10 employees for this owner
        $employees = Employee::query()->where('user_id', $ownerId)->take(10)->get();
        if ($employees->count() < 10) {
            $needed = 10 - $employees->count();
            for ($i = 1; $i <= $needed; $i++) {
                $code = 'EMP-DUMMY-'.str_pad((string) ($employees->count() + $i), 4, '0', STR_PAD_LEFT);
                Employee::create([
                    'user_id' => $ownerId,
                    'employee_code' => $code,
                    'first_name' => 'Karyawan',
                    'last_name' => "Dummy {$i}",
                    'email' => "karyawan.dummy.{$i}@example.com",
                    'phone' => '0812'.random_int(10000000, 99999999),
                    'hire_date' => '2025-01-01',
                    'employment_status' => 'active',
                    'employment_type' => 'PKWTT',
                    'base_salary' => 6000000 + ($i * 500000),
                    'salary_type' => 'gross',
                    'is_active' => true,
                ]);
            }
            $employees = Employee::query()->where('user_id', $ownerId)->take(10)->get();
        }

        $empList = $employees->values();
        $targetEmployeeIds = $empList->pluck('id')->all();

        // Ensure these 10 are active
        Employee::query()->where('user_id', $ownerId)->whereIn('id', $targetEmployeeIds)->update([
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        // Set remaining employees of this company to inactive
        Employee::query()->where('user_id', $ownerId)->whereNotIn('id', $targetEmployeeIds)->update([
            'is_active' => false,
            'employment_status' => 'inactive',
        ]);

        // Ensure company settings
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
                'payroll_cutoff_day' => 'end_of_month',
                'active_working_days' => 22,
            ]);
        }

        $shift = WorkShift::query()->where('user_id', $ownerId)->where('code', '0817')->first()
            ?? WorkShift::query()->where('user_id', $ownerId)->where('is_day_off', false)->first();

        $startAll = Carbon::parse('2026-09-01');
        $endAll = Carbon::parse('2026-11-30');
        $today = Carbon::parse('2026-11-16');

        // 2. Clear old data for these 3 months for user 1
        EmployeeSchedule::query()->where('user_id', $ownerId)
            ->whereBetween('work_date', [$startAll->toDateString(), $endAll->toDateString()])
            ->delete();

        LeaveRequest::query()->where('user_id', $ownerId)
            ->whereDate('start_date', '>=', $startAll->toDateString())
            ->whereDate('end_date', '<=', $endAll->toDateString())
            ->delete();

        OvertimeRequest::query()->where('user_id', $ownerId)
            ->whereBetween('work_date', [$startAll->toDateString(), $endAll->toDateString()])
            ->delete();

        EmployeeAttendance::query()->where('user_id', $ownerId)
            ->whereBetween('attendance_date', [$startAll->toDateString(), $endAll->toDateString()])
            ->delete();

        $oldRuns = PayrollRun::query()->where('user_id', $ownerId)->whereIn('period', ['2026-09', '2026-10', '2026-11'])->get();
        if ($oldRuns->isNotEmpty()) {
            PayrollItem::query()->whereIn('payroll_run_id', $oldRuns->pluck('id'))->delete();
            PayrollRun::query()->whereIn('id', $oldRuns->pluck('id'))->delete();
        }

        // 3. Create Schedules (Sep, Oct, Nov)
        $scheduleRows = [];
        for ($date = $startAll->copy(); $date->lte($endAll); $date->addDay()) {
            $isWeekend = $date->isWeekend();
            $dateStr = $date->toDateString();

            foreach ($employees as $emp) {
                $scheduleRows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $emp->id,
                    'work_date' => $dateStr,
                    'shift_code' => $isWeekend ? 'OFF' : ($shift?->code ?? '0817'),
                    'start_time' => $isWeekend ? null : ($shift?->start_time ?? '08:00:00'),
                    'end_time' => $isWeekend ? null : ($shift?->end_time ?? '17:00:00'),
                    'is_day_off' => $isWeekend,
                    'is_wfa' => false,
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        foreach (array_chunk($scheduleRows, 250) as $chunk) {
            EmployeeSchedule::query()->insert($chunk);
        }

        // 4. Create Leaves
        $leaves = [
            // Sept 2026
            ['employee_id' => $empList[1]->id, 'leave_type' => 'annual', 'start_date' => '2026-09-14', 'end_date' => '2026-09-15', 'total_days' => 2, 'reason' => 'Cuti Tahunan - Urusan Keluarga', 'status' => 'approved'],
            ['employee_id' => $empList[4]->id, 'leave_type' => 'sick', 'start_date' => '2026-09-21', 'end_date' => '2026-09-21', 'total_days' => 1, 'reason' => 'Sakit Demam & Flu (Surat Dokter)', 'status' => 'approved'],
            ['employee_id' => $empList[2]->id, 'leave_type' => 'annual', 'start_date' => '2026-09-28', 'end_date' => '2026-09-28', 'total_days' => 1, 'reason' => 'Cuti Tahunan Pribadi', 'status' => 'approved'],

            // Oct 2026
            ['employee_id' => $empList[3]->id, 'leave_type' => 'annual', 'start_date' => '2026-10-08', 'end_date' => '2026-10-09', 'total_days' => 2, 'reason' => 'Cuti Tahunan - Liburan Keluarga', 'status' => 'approved'],
            ['employee_id' => $empList[7]->id, 'leave_type' => 'sick', 'start_date' => '2026-10-15', 'end_date' => '2026-10-15', 'total_days' => 1, 'reason' => 'Sakit Migrain (Surat Dokter)', 'status' => 'approved'],
            ['employee_id' => $empList[9]->id, 'leave_type' => 'annual', 'start_date' => '2026-10-22', 'end_date' => '2026-10-23', 'total_days' => 2, 'reason' => 'Cuti Acara Pernikahan Saudara', 'status' => 'approved'],

            // Nov 2026 (Bulan berjalan)
            ['employee_id' => $empList[6]->id, 'leave_type' => 'annual', 'start_date' => '2026-11-05', 'end_date' => '2026-11-06', 'total_days' => 2, 'reason' => 'Cuti Tahunan', 'status' => 'approved'],
            ['employee_id' => $empList[8]->id, 'leave_type' => 'sick', 'start_date' => '2026-11-12', 'end_date' => '2026-11-12', 'total_days' => 1, 'reason' => 'Sakit Flu & Batuk', 'status' => 'approved'],
            ['employee_id' => $empList[5]->id, 'leave_type' => 'annual', 'start_date' => '2026-11-20', 'end_date' => '2026-11-20', 'total_days' => 1, 'reason' => 'Cuti Tahunan Akhir Pekan', 'status' => 'pending'],
        ];

        $approvedLeavesMap = [];
        foreach ($leaves as $item) {
            LeaveRequest::query()->create([
                'user_id' => $ownerId,
                'employee_id' => $item['employee_id'],
                'leave_type' => $item['leave_type'],
                'start_date' => $item['start_date'],
                'end_date' => $item['end_date'],
                'total_days' => $item['total_days'],
                'reason' => $item['reason'],
                'status' => $item['status'],
                'approval_levels' => 1,
                'approval_stage' => $item['status'] === 'approved' ? 1 : 0,
                'approved_at' => $item['status'] === 'approved' ? now() : null,
                'approved_by' => $item['status'] === 'approved' ? $ownerId : null,
            ]);

            if ($item['status'] === 'approved') {
                $cStart = Carbon::parse($item['start_date']);
                $cEnd = Carbon::parse($item['end_date']);
                for ($d = $cStart->copy(); $d->lte($cEnd); $d->addDay()) {
                    $approvedLeavesMap[$item['employee_id']][$d->toDateString()] = $item['reason'];
                }
            }
        }

        // 5. Create Overtimes
        $overtimes = [
            // Sept 2026
            ['employee_id' => $empList[0]->id, 'work_date' => '2026-09-04', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Review Evaluasi Q3 Management', 'status' => 'approved'],
            ['employee_id' => $empList[3]->id, 'work_date' => '2026-09-11', 'start_time' => '18:00:00', 'end_time' => '21:00:00', 'total_hours' => 3.0, 'reason' => 'Maintenance Server & Operasional', 'status' => 'approved'],
            ['employee_id' => $empList[5]->id, 'work_date' => '2026-09-18', 'start_time' => '18:00:00', 'end_time' => '20:30:00', 'total_hours' => 2.5, 'reason' => 'Update Sistem HR & Absensi', 'status' => 'approved'],

            // Oct 2026
            ['employee_id' => $empList[1]->id, 'work_date' => '2026-10-06', 'start_time' => '18:00:00', 'end_time' => '21:00:00', 'total_hours' => 3.0, 'reason' => 'Screening Kandidat Batch Rekrutmen', 'status' => 'approved'],
            ['employee_id' => $empList[6]->id, 'work_date' => '2026-10-14', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Pengadaan Logistik Kantor', 'status' => 'approved'],
            ['employee_id' => $empList[8]->id, 'work_date' => '2026-10-21', 'start_time' => '18:00:00', 'end_time' => '20:30:00', 'total_hours' => 2.5, 'reason' => 'Materi Kampanye Marketing Q4', 'status' => 'approved'],
            ['employee_id' => $empList[9]->id, 'work_date' => '2026-10-28', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Rekonsiliasi Pajak Bulanan', 'status' => 'approved'],

            // Nov 2026 (Bulan berjalan)
            ['employee_id' => $empList[7]->id, 'work_date' => '2026-11-04', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Rekap Data Penjualan Q4', 'status' => 'approved'],
            ['employee_id' => $empList[9]->id, 'work_date' => '2026-11-10', 'start_time' => '18:00:00', 'end_time' => '21:00:00', 'total_hours' => 3.0, 'reason' => 'Audit Keuangan Internal Tahunan', 'status' => 'approved'],
            ['employee_id' => $empList[4]->id, 'work_date' => '2026-11-13', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Persiapan Pelatihan Karyawan', 'status' => 'approved'],
            ['employee_id' => $empList[5]->id, 'work_date' => '2026-11-16', 'start_time' => '18:00:00', 'end_time' => '20:00:00', 'total_hours' => 2.0, 'reason' => 'Penyelesaian Tiket IT Kantor Hari Ini', 'status' => 'pending'],
        ];

        foreach ($overtimes as $item) {
            OvertimeRequest::query()->create([
                'user_id' => $ownerId,
                'employee_id' => $item['employee_id'],
                'work_date' => $item['work_date'],
                'start_time' => $item['start_time'],
                'end_time' => $item['end_time'],
                'break_minutes' => 0,
                'total_hours' => $item['total_hours'],
                'reason' => $item['reason'],
                'status' => $item['status'],
                'approval_levels' => 1,
                'approval_stage' => $item['status'] === 'approved' ? 1 : 0,
                'approved_at' => $item['status'] === 'approved' ? now() : null,
                'approved_by' => $item['status'] === 'approved' ? $ownerId : null,
            ]);
        }

        // 6. Create Attendances (Sep 1 to Nov 16)
        $latBase = -8.6456931;
        $lngBase = 115.2025754;

        $attendanceRows = [];

        for ($date = $startAll->copy(); $date->lte($today); $date->addDay()) {
            if ($date->isWeekend()) {
                continue;
            }

            $dateStr = $date->toDateString();

            foreach ($employees as $emp) {
                // Check if on leave
                if (isset($approvedLeavesMap[$emp->id][$dateStr])) {
                    $attendanceRows[] = [
                        'user_id' => $ownerId,
                        'employee_id' => $emp->id,
                        'shift_id' => $shift?->id,
                        'attendance_date' => $dateStr,
                        'status' => 'leave',
                        'late_minutes' => null,
                        'late_level' => null,
                        'late_penalty' => 0.00,
                        'is_half_day' => false,
                        'check_in_at' => null,
                        'check_out_at' => null,
                        'check_in_latitude' => null,
                        'check_in_longitude' => null,
                        'check_out_latitude' => null,
                        'check_out_longitude' => null,
                        'notes' => $approvedLeavesMap[$emp->id][$dateStr],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    continue;
                }

                // Normal / Late
                $inMinute = random_int(46, 56);
                $outMinute = random_int(6, 25);
                $checkInAt = Carbon::parse("{$dateStr} 07:{$inMinute}:00");
                $checkOutAt = Carbon::parse("{$dateStr} 17:{$outMinute}:00");
                $status = 'present';
                $lateMinutes = null;
                $lateLevel = null;
                $latePenalty = 0.00;
                $notes = null;

                // Specific late scenarios
                if ($emp->id === $empList[5]->id && $dateStr === '2026-09-08') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:24:00");
                    $status = 'late';
                    $lateMinutes = 24;
                    $lateLevel = 'level_1';
                    $latePenalty = 20000.00;
                    $notes = 'Terlambat 24 menit (Macet)';
                } elseif ($emp->id === $empList[3]->id && $dateStr === '2026-09-23') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:35:00");
                    $status = 'late';
                    $lateMinutes = 35;
                    $lateLevel = 'level_2';
                    $latePenalty = 50000.00;
                    $notes = 'Terlambat 35 menit';
                } elseif ($emp->id === $empList[1]->id && $dateStr === '2026-10-12') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:20:00");
                    $status = 'late';
                    $lateMinutes = 20;
                    $lateLevel = 'level_1';
                    $latePenalty = 20000.00;
                    $notes = 'Terlambat 20 menit';
                } elseif ($emp->id === $empList[7]->id && $dateStr === '2026-10-27') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:40:00");
                    $status = 'late';
                    $lateMinutes = 40;
                    $lateLevel = 'level_2';
                    $latePenalty = 50000.00;
                    $notes = 'Terlambat 40 menit';
                } elseif ($emp->id === $empList[4]->id && $dateStr === '2026-11-09') {
                    $checkInAt = Carbon::parse("{$dateStr} 08:18:00");
                    $status = 'late';
                    $lateMinutes = 18;
                    $lateLevel = 'level_1';
                    $latePenalty = 20000.00;
                    $notes = 'Terlambat 18 menit';
                }

                $jitterLat = (random_int(-50, 50) / 1000000);
                $jitterLng = (random_int(-50, 50) / 1000000);

                $attendanceRows[] = [
                    'user_id' => $ownerId,
                    'employee_id' => $emp->id,
                    'shift_id' => $shift?->id,
                    'attendance_date' => $dateStr,
                    'status' => $status,
                    'late_minutes' => $lateMinutes,
                    'late_level' => $lateLevel,
                    'late_penalty' => round($latePenalty, 2),
                    'is_half_day' => false,
                    'check_in_at' => $checkInAt,
                    'check_out_at' => $checkOutAt,
                    'check_in_latitude' => round($latBase + $jitterLat, 7),
                    'check_in_longitude' => round($lngBase + $jitterLng, 7),
                    'check_out_latitude' => round($latBase + $jitterLat, 7),
                    'check_out_longitude' => round($lngBase + $jitterLng, 7),
                    'notes' => $notes,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($attendanceRows, 250) as $chunk) {
            EmployeeAttendance::query()->insert($chunk);
        }

        // 7. Generate Payrolls using PayrollGenerationService
        $payrollService = app(PayrollGenerationService::class);

        // 7a. September 2026 (Released)
        $septRun = $payrollService->generateForPeriod(
            ownerId: $ownerId,
            period: '2026-09',
            generatedBy: $ownerId,
            selectedEmployeeIds: $targetEmployeeIds,
        );
        $septRun->update([
            'status' => 'released',
            'is_saved' => true,
            'released_at' => Carbon::parse('2026-09-30 17:30:00'),
            'released_by' => $ownerId,
            'saved_at' => Carbon::parse('2026-09-30 17:30:00'),
        ]);

        // 7b. October 2026 (Released)
        $octRun = $payrollService->generateForPeriod(
            ownerId: $ownerId,
            period: '2026-10',
            generatedBy: $ownerId,
            selectedEmployeeIds: $targetEmployeeIds,
        );
        $octRun->update([
            'status' => 'released',
            'is_saved' => true,
            'released_at' => Carbon::parse('2026-10-31 17:30:00'),
            'released_by' => $ownerId,
            'saved_at' => Carbon::parse('2026-10-31 17:30:00'),
        ]);

        // 7c. November 2026 (Released)
        $novRun = $payrollService->generateForPeriod(
            ownerId: $ownerId,
            period: '2026-11',
            generatedBy: $ownerId,
            selectedEmployeeIds: $targetEmployeeIds,
        );
        $novRun->update([
            'status' => 'released',
            'is_saved' => true,
            'released_at' => Carbon::parse('2026-11-16 17:30:00'),
            'released_by' => $ownerId,
            'saved_at' => Carbon::parse('2026-11-16 17:30:00'),
        ]);

        $this->command?->info("Dummy data created successfully for 10 employees across 3 months (Sept, Oct, Nov 2026)!");
    }
}
