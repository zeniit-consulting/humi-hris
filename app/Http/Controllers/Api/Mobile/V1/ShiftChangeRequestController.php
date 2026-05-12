<?php

namespace App\Http\Controllers\Api\Mobile\V1;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\EmployeeSchedule;
use App\Models\ShiftChangeRequest;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ShiftChangeRequestController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $requests = ShiftChangeRequest::query()
            ->with(['currentShift:id,code,name,start_time,end_time,is_day_off', 'requestedShift:id,code,name,start_time,end_time,is_day_off'])
            ->where('user_id', $user->accountOwnerId())
            ->where('employee_id', $employee->id)
            ->latest('requested_date')
            ->latest('id')
            ->limit(15)
            ->get();

        return $this->success([
            'items' => $requests->map(fn (ShiftChangeRequest $request) => $this->payload($request))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $ownerId = $user->accountOwnerId();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $validated = $request->validate([
            'requested_date' => ['required', 'date', 'after_or_equal:today'],
            'requested_shift_id' => ['required', 'integer', Rule::exists('work_shifts', 'id')->where('user_id', $ownerId)],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $requestedDate = Carbon::parse($validated['requested_date'])->toDateString();
        $currentSchedule = EmployeeSchedule::query()
            ->where('employee_id', $employee->id)
            ->whereDate('work_date', $requestedDate)
            ->first();

        $currentShift = $currentSchedule?->shift_code
            ? WorkShift::query()
                ->where('user_id', $ownerId)
                ->where('code', $currentSchedule->shift_code)
                ->first()
            : null;

        $shiftRequest = ShiftChangeRequest::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employee->id,
            'requested_date' => $requestedDate,
            'current_shift_id' => $currentShift?->id,
            'requested_shift_id' => $validated['requested_shift_id'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        $shiftRequest->load(['currentShift:id,code,name,start_time,end_time,is_day_off', 'requestedShift:id,code,name,start_time,end_time,is_day_off']);

        return $this->success($this->payload($shiftRequest), 'Pengajuan ubah shift berhasil dikirim.', 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(ShiftChangeRequest $request): array
    {
        return [
            'id' => $request->id,
            'requested_date' => $request->requested_date?->format('Y-m-d'),
            'current_shift' => $request->currentShift ? [
                'id' => $request->currentShift->id,
                'code' => $request->currentShift->code,
                'name' => $request->currentShift->name,
                'start_time' => $request->currentShift->start_time,
                'end_time' => $request->currentShift->end_time,
                'is_day_off' => $request->currentShift->is_day_off,
            ] : null,
            'requested_shift' => $request->requestedShift ? [
                'id' => $request->requestedShift->id,
                'code' => $request->requestedShift->code,
                'name' => $request->requestedShift->name,
                'start_time' => $request->requestedShift->start_time,
                'end_time' => $request->requestedShift->end_time,
                'is_day_off' => $request->requestedShift->is_day_off,
            ] : null,
            'reason' => $request->reason,
            'status' => $request->status,
            'rejection_reason' => $request->rejection_reason,
        ];
    }
}
