<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Services\MonthlyReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportController extends Controller
{
    public function index(Request $request, MonthlyReportService $reports): InertiaResponse
    {
        [$month, $year] = $this->period($request);
        $data = $reports->build($request->user()->accountOwnerId(), $month, $year);

        return Inertia::render('hris/reports/index', [
            ...$data,
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
        ]);
    }

    public function export(Request $request, MonthlyReportService $reports): Response
    {
        [$month, $year] = $this->period($request);
        $data = $reports->build($request->user()->accountOwnerId(), $month, $year);
        $documentTitle = 'Laporan_HRIS_'.$data['period']['key'].'.pdf';

        return Pdf::loadView('hris.reports.monthly', [
            ...$data,
            'documentTitle' => $documentTitle,
        ])
            ->setPaper('a4', 'landscape')
            ->download($documentTitle);
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function period(Request $request): array
    {
        $validated = $request->validate([
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:'.(now()->year + 1)],
        ]);

        return [
            (int) ($validated['month'] ?? now()->month),
            (int) ($validated['year'] ?? now()->year),
        ];
    }
}
