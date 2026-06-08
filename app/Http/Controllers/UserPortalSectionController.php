<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\User;
use App\Services\PayslipPdfService;
use App\Support\RoleRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserPortalSectionController extends Controller
{
    public function attendance(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/attendance', 'Jadwal');
    }

    public function checkIn(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/check-in', 'Absensi');
    }

    public function checkOut(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/check-out', 'Pulang');
    }

    public function shiftChange(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/shift-change', 'Ubah Jadwal');
    }

    public function attendanceRequest(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/attendance-request', 'Request Absensi');
    }

    public function leaves(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/leaves', 'Leave');
    }

    public function overtimes(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/overtimes', 'Overtime');
    }

    public function kasbons(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/kasbons', 'Kasbon');
    }

    public function payroll(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/payroll', 'Payroll');
    }

    public function activity(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/activity', 'Aktivitas');
    }

    public function profile(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/profile', 'Profile');
    }

    public function announcements(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/announcements', 'Announcements');
    }

    public function surveys(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/surveys', 'Surveys');
    }

    public function assets(Request $request): Response|RedirectResponse
    {
        return $this->renderForUser($request, 'portal/assets', 'Assets');
    }

    public function previewPayslip(Request $request): JsonResponse|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== 'user') {
            return redirect()->to(RoleRedirect::for($user));
        }

        $validated = $request->validate([
            'period' => ['required', 'date_format:Y-m'],
            'current_password' => ['required', 'string', 'current_password'],
        ]);

        $employee = $this->resolveSelfServiceEmployee($user);
        abort_unless($employee !== null, 404);

        $run = $this->findPayrollRunForEmployee($employee, $validated['period']);

        return response()->json([
            'success' => true,
            'message' => 'Slip gaji berhasil diverifikasi.',
            'data' => $this->payrollPreviewPayload($validated['period'], $run, $employee),
        ]);
    }

    public function exportPayslip(HttpRequest $request, PayslipPdfService $payslipPdfService): HttpResponse|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== 'user') {
            return redirect()->to(RoleRedirect::for($user));
        }

        $validated = $request->validate([
            'period' => ['required', 'date_format:Y-m'],
            'current_password' => ['required', 'string', 'current_password'],
        ]);

        $period = $validated['period'];
        $employee = $this->resolveSelfServiceEmployee($user);

        abort_unless($employee !== null, 404);

        $run = $this->findPayrollRunForEmployee($employee, $period);

        abort_unless($run !== null && $run->items->isNotEmpty(), 404);

        $slip = $run->items->first();

        return $payslipPdfService->download($run, $slip, $user->accountOwnerId());
    }

    private function findPayrollRunForEmployee(Employee $employee, string $period): ?PayrollRun
    {
        return PayrollRun::query()
            ->with([
                'items' => fn ($query) => $query
                    ->where('employee_id', $employee->id)
                    ->with('employee:id,employee_code,first_name,last_name,division_id,position_id'),
                'items.employee.division:id,name',
                'items.employee.position:id,name',
            ])
            ->where('user_id', $employee->user_id)
            ->where('period', $period)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function payrollPreviewPayload(string $period, ?PayrollRun $run, Employee $employee): array
    {
        $items = $run?->items
            ? $run->items->where('employee_id', $employee->id)->values()
            : collect();

        return [
            'period' => $period,
            'run' => $run ? [
                'id' => $run->id,
                'period' => $run->period,
                'period_start' => $run->period_start?->format('Y-m-d'),
                'period_end' => $run->period_end?->format('Y-m-d'),
                'generated_at' => $run->generated_at?->toDateTimeString(),
                'is_saved' => $run->is_saved,
            ] : null,
            'items' => $items->map(fn (PayrollItem $item) => [
                'id' => $item->id,
                'employee_id' => $item->employee_id,
                'employee_label' => $item->employee
                    ? $item->employee->employee_code.' - '.$item->employee->full_name
                    : '-',
                'base_salary' => $item->base_salary,
                'allowances_total' => $item->allowances_total,
                'pph21_method' => $item->pph21_method,
                'pph21_rate' => $item->pph21_rate,
                'pph21_allowance' => $item->pph21_allowance,
                'pph21_deduction' => $item->pph21_deduction,
                'pph21_company_borne' => $item->pph21_company_borne,
                'kasbon_deduction' => $item->kasbon_deduction,
                'denda_deduction' => $item->denda_deduction,
                'deductions_total' => $item->deductions_total,
                'net_salary' => $item->net_salary,
                'allowance_breakdown' => $item->allowance_breakdown ?? [],
            ])->values(),
        ];
    }

    private function renderForUser(Request $request, string $page, string $title): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== 'user') {
            return redirect()->to(RoleRedirect::for($user));
        }

        return Inertia::render($page, [
            'pageTitle' => $title,
        ]);
    }

    private function resolveSelfServiceEmployee(User $user): ?Employee
    {
        if (! $user->email && ! $user->phone) {
            return null;
        }

        return Employee::query()
            ->where(function ($query) use ($user): void {
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
}
