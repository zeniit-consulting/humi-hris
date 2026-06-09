<?php

namespace App\Http\Controllers\Api\ThirdParty\V1\Concerns;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait InteractsWithThirdPartyApi
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function error(string $message, int $status = 422, mixed $data = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function paginated(LengthAwarePaginator $paginator, callable $mapper, string $message = 'OK'): JsonResponse
    {
        return $this->success([
            'items' => collect($paginator->items())->map($mapper)->values(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ], $message);
    }

    /**
     * @return array{id:int, employee_code:string|null, full_name:string, email:string|null, phone:string|null}
     */
    protected function employeeSummary(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->full_name,
            'email' => $employee->email,
            'phone' => $employee->phone,
        ];
    }
}
