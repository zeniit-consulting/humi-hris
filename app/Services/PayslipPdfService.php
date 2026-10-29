<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PayslipPdfService
{
    public function download(PayrollRun $run, PayrollItem $slip, int $ownerId): Response
    {
        $documentTitle = $this->documentTitle($slip->employee, $run->period, $run->code);

        return Pdf::loadView('hris.payrolls.payslip', $this->viewData($run, $slip, $ownerId, $documentTitle))
            ->setPaper('a5')
            ->download($documentTitle);
    }

    public function output(PayrollRun $run, PayrollItem $slip, int $ownerId): string
    {
        $documentTitle = $this->documentTitle($slip->employee, $run->period, $run->code);

        return Pdf::loadView('hris.payrolls.payslip', $this->viewData($run, $slip, $ownerId, $documentTitle))
            ->setPaper('a5')
            ->output();
    }

    public function documentTitle(?Employee $employee, string $period, ?string $code = null): string
    {
        return sprintf(
            'Payslip_%s_%s%s.pdf',
            $employee?->employee_code ?: 'employee',
            Str::replace('-', '', $period),
            $code ? '_'.$code : '',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function viewData(PayrollRun $run, PayrollItem $slip, int $ownerId, string $documentTitle): array
    {
        $companySetting = CompanySetting::query()->firstOrCreate(
            ['user_id' => $ownerId],
            [
                'name' => 'Perusahaan',
                'details' => null,
            ],
        );

        $employee = $slip->employee()->where('user_id', $ownerId)->with(['division:id,name', 'position:id,name', 'subCompany:id,name,address'])->first();

        $subCompany = $employee?->subCompany;
        $companyName = $slip->company_name ?: ($subCompany?->name ?: $companySetting->name);
        $companyDetails = $slip->company_name ? $slip->company_details : ($subCompany ? $subCompany->address : $companySetting->details);
        $eventOvertimes = collect();
        if ($run->batch_purpose !== 'additional' && $employee && $run->period_start && $run->period_end) {
            $eventOvertimes = \App\Models\OvertimeRequest::query()
                ->where('employee_id', $employee->id)
                ->where('is_event', true)
                ->where('status', 'approved')
                ->whereBetween('work_date', [$run->period_start->toDateString(), $run->period_end->toDateString()])
                ->orderBy('work_date')
                ->get();
        }

        return [
            'documentTitle' => $documentTitle,
            'companyName' => $companyName,
            'companyDetails' => $companyDetails,
            'companyLogoPath' => $this->companyLogoPath($slip, $employee, $companySetting, $ownerId),
            'employee' => $employee,
            'run' => $run,
            'slip' => $slip,
            'eventOvertimes' => $eventOvertimes,
            'periodLabel' => $run->period_start?->locale('id')->translatedFormat('F Y') ?? $run->period,
        ];
    }

    private function companyLogoPath(PayrollItem $slip, ?Employee $employee, CompanySetting $parent, int $ownerId): ?string
    {
        $identity = $slip->company_identity;
        if ($identity && ((int) ($identity['owner_id'] ?? 0) !== $ownerId || ! empty($identity['unresolved']))) {
            return null;
        }
        $subCompanyId = $identity !== null ? ($identity['sub_company_id'] ?? null) : $employee?->sub_company_id;
        $company = $subCompanyId
            ? SubCompany::query()->where('user_id', $ownerId)->find($subCompanyId)
            : $parent;
        if (! $company || (! $identity && $slip->company_name && $slip->company_name !== $company->name)) {
            return null;
        }
        $path = $company->logo_path;
        if (! $path || ! str_starts_with($path, 'company-logos/') || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->path($path);
    }
}
