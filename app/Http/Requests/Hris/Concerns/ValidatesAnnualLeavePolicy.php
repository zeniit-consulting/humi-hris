<?php

namespace App\Http\Requests\Hris\Concerns;

use App\Models\Employee;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

trait ValidatesAnnualLeavePolicy
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty() || $this->input('leave_type') !== 'annual') {
                return;
            }

            $owner = User::find($this->user()->accountOwnerId());
            $employee = Employee::withoutGlobalScopes()
                ->where('user_id', $owner?->id)
                ->find($this->integer('employee_id'));

            if (! $owner || ! $employee) {
                return;
            }

            $service = app(LeaveBalanceService::class);
            $policy = $service->getPolicy($owner, 'annual');

            if (! $policy) {
                return;
            }

            $startDate = Carbon::parse($this->input('start_date'));
            $totalDays = (float) $startDate->diffInDays(Carbon::parse($this->input('end_date'))) + 1;
            $message = $service->requestEligibilityError($employee, $policy, $startDate, $totalDays);

            if ($message) {
                $validator->errors()->add('total_days', $message);
            }
        });
    }
}
