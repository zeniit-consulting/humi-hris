<?php

namespace App\Services;

use App\Models\ApprovalSetting;
use App\Models\AttendanceCorrectionRequest;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeavePolicy;
use App\Models\OvertimeRequest;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ApprovalWorkflowService
{
    public const ADVANCED = 'advanced';
    public const FINAL = 'final';

    public function snapshot(Model $request): void
    {
        if (! $request->employee_id || ! $request->user_id) return;
        $employee = Employee::query()->with('position')->find($request->employee_id);
        if (! $employee) return;
        $setting = ApprovalSetting::query()->firstWhere([
            'user_id' => $request->user_id,
            'request_type' => $this->typeFor($request),
        ]);
        $first = $setting?->first_approver_employee_id ?: $this->defaultFirst($employee);
        $second = $setting?->second_approver_employee_id ?: $this->defaultSecond((int) $request->user_id);
        $request->approval_levels = $setting
            ? ($setting->two_line_enabled ? 2 : 1)
            : $this->legacyApprovalLevels($request);
        $request->approval_stage = 0;
        $request->first_approver_employee_id = $first;
        $request->second_approver_employee_id = $request->approval_levels === 2 ? $second : null;
    }

    public function approve(Model $request, User $actor): string
    {
        if ($request->status !== 'pending') throw ValidationException::withMessages(['approval' => 'Request sudah diproses.']);
        $stage = (int) $request->approval_stage;
        if ((int) $request->approval_levels === 2 && $stage === 1 && (int) $request->first_approved_by === (int) $actor->id) {
            throw ValidationException::withMessages(['approval' => 'Approver tingkat 2 harus berbeda dari approver tingkat 1.']);
        }
        $expectedId = $stage === 0 ? $request->first_approver_employee_id : $request->second_approver_employee_id;
        $this->ensureActor($actor, $expectedId ? (int) $expectedId : null);
        if ((int) $request->approval_levels === 2 && $stage === 0) {
            $request->update(['approval_stage' => 1, 'first_approved_by' => $actor->id, 'first_approved_at' => now(), 'rejection_reason' => null]);
            return self::ADVANCED;
        }
        return self::FINAL;
    }

    public function reject(Model $request, User $actor, string $reason): void
    {
        if ($request->status !== 'pending') throw ValidationException::withMessages(['approval' => 'Request sudah diproses.']);
        $expectedId = (int) $request->approval_stage === 0 ? $request->first_approver_employee_id : $request->second_approver_employee_id;
        $this->ensureActor($actor, $expectedId ? (int) $expectedId : null);
        $request->update(['status' => 'rejected', 'approved_by' => $actor->id, 'approved_at' => now(), 'rejection_reason' => $reason, 'rejection_stage' => (int) $request->approval_stage + 1]);
    }

    private function ensureActor(User $actor, ?int $expectedEmployeeId): void
    {
        if ($actor->role !== 'user') return;
        $employee = Employee::query()->where(function ($query) use ($actor): void {
            $actor->email ? $query->where('email', $actor->email) : $query->whereRaw('1 = 0');
            if ($actor->phone) $query->orWhere('phone', $actor->phone);
        })->first();
        if (! $employee || $employee->id !== $expectedEmployeeId) throw ValidationException::withMessages(['approval' => 'Anda bukan approver untuk tahap ini.']);
    }

    private function defaultFirst(Employee $requester): ?int
    {
        return Employee::query()->where('user_id', $requester->user_id)->where('division_id', $requester->division_id)->where('is_active', true)
            ->whereHas('position', fn ($query) => $query->where('level', '1'))->value('id');
    }
    private function defaultSecond(int $ownerId): ?int
    {
        return Employee::query()->where('user_id', $ownerId)->where('is_active', true)->whereHas('position', fn ($query) => $query->where('level', '0'))->value('id');
    }
    private function typeFor(Model $request): string
    {
        return match ($request::class) { AttendanceCorrectionRequest::class => 'attendance', LeaveRequest::class => 'leave', OvertimeRequest::class => 'overtime', ShiftChangeRequest::class => 'shift_change' };
    }

    private function legacyApprovalLevels(Model $request): int
    {
        if (! $request instanceof LeaveRequest) return 1;

        return (int) (LeavePolicy::query()
            ->where('user_id', $request->user_id)
            ->where('leave_type', $request->leave_type)
            ->where('is_active', true)
            ->value('approval_levels') ?: 1);
    }
}
