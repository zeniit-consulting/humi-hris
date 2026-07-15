<?php

namespace App\Services;

use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeEmploymentHistory;
use App\Models\Position;
use App\Models\User;

class EmployeeEmploymentHistoryService
{
    /** @param array<string, mixed> $before */
    public function recordChanges(Employee $employee, array $before, string $effectiveDate, ?string $notes, User $actor): void
    {
        if (($before['employment_status'] ?? null) !== $employee->employment_status) {
            $this->create($employee, $actor, [
                'event_type' => 'status_change',
                'effective_date' => $effectiveDate,
                'old_status' => $before['employment_status'] ?? null,
                'new_status' => $employee->employment_status,
                'notes' => $notes,
            ]);
        }

        $oldDivisionId = $before['division_id'] ?? null;
        $oldPositionId = $before['position_id'] ?? null;

        if ((int) $oldDivisionId === (int) $employee->division_id && (int) $oldPositionId === (int) $employee->position_id) {
            return;
        }

        $oldDivision = $oldDivisionId ? Division::query()->find($oldDivisionId) : null;
        $newDivision = $employee->division_id ? Division::query()->find($employee->division_id) : null;
        $oldPosition = $oldPositionId ? Position::query()->find($oldPositionId) : null;
        $newPosition = $employee->position_id ? Position::query()->find($employee->position_id) : null;

        $eventType = $this->careerEventType($oldDivisionId, $employee->division_id, $oldPosition, $newPosition);

        $this->create($employee, $actor, [
            'event_type' => $eventType,
            'effective_date' => $effectiveDate,
            'old_division_id' => $oldDivisionId,
            'new_division_id' => $employee->division_id,
            'old_division_name' => $oldDivision?->name,
            'new_division_name' => $newDivision?->name,
            'old_position_id' => $oldPositionId,
            'new_position_id' => $employee->position_id,
            'old_position_name' => $oldPosition?->name,
            'new_position_name' => $newPosition?->name,
            'notes' => $notes,
        ]);
    }

    public function recordPkwttActivation(Employee $employee, string $oldStatus, string $effectiveDate, ?string $notes, User $actor): void
    {
        $this->create($employee, $actor, [
            'event_type' => 'pkwtt_activation',
            'effective_date' => $effectiveDate,
            'old_status' => $oldStatus,
            'new_status' => $employee->employment_status,
            'notes' => $notes,
        ]);
    }

    private function careerEventType(mixed $oldDivisionId, mixed $newDivisionId, ?Position $oldPosition, ?Position $newPosition): string
    {
        if ($oldPosition && $newPosition && is_numeric($oldPosition->level) && is_numeric($newPosition->level)) {
            if ((int) $newPosition->level < (int) $oldPosition->level) {
                return 'promotion';
            }

            if ((int) $newPosition->level > (int) $oldPosition->level) {
                return 'demotion';
            }
        }

        if ((int) $oldPosition?->id !== (int) $newPosition?->id) {
            return 'position_change';
        }

        return (int) $oldDivisionId !== (int) $newDivisionId ? 'division_transfer' : 'position_change';
    }

    /** @param array<string, mixed> $data */
    private function create(Employee $employee, User $actor, array $data): void
    {
        EmployeeEmploymentHistory::query()->create([
            'user_id' => $employee->user_id,
            'employee_id' => $employee->id,
            'created_by_user_id' => $actor->id,
            ...$data,
        ]);
    }
}
