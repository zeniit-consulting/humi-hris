<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\InteractsWithMobileApiResponse;
use App\Http\Controllers\Api\Mobile\V1\Concerns\InteractsWithSelfService;
use App\Http\Controllers\Controller;
use App\Models\CompanyAssetAssignment;
use App\Models\EmployeeReprimand;
use App\Models\EmployeeSurvey;
use App\Models\EmployeeSurveyResponse;
use App\Models\NotificationAnnouncement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalResourceController extends Controller
{
    use InteractsWithMobileApiResponse, InteractsWithSelfService;

    public function announcements(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $today = now();

        $items = NotificationAnnouncement::query()
            ->where('status', 'published')
            ->where('channel', 'portal')
            ->where(function ($query) use ($employee): void {
                $query->where('audience', 'all');

                if ($employee->is_active) {
                    $query->orWhere('audience', 'active_employees');
                } else {
                    $query->orWhere('audience', 'inactive_employees');
                }
            })
            ->where(function ($query) use ($today): void {
                $query->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', $today);
            })
            ->where(function ($query) use ($today): void {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', $today);
            })
            ->latest('publish_at')
            ->latest('id')
            ->get()
            ->map(fn (NotificationAnnouncement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'message' => $announcement->message,
                'publish_at' => $announcement->publish_at?->toIso8601String(),
                'expires_at' => $announcement->expires_at?->toIso8601String(),
            ])
            ->values();

        return $this->success([
            'items' => $items,
        ]);
    }

    public function surveys(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);
        $today = now();

        $surveys = EmployeeSurvey::query()
            ->where('status', 'active')
            ->where(function ($query) use ($today): void {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', $today);
            })
            ->where(function ($query) use ($today): void {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', $today);
            })
            ->latest('starts_at')
            ->latest('id')
            ->get()
            ->map(function (EmployeeSurvey $survey) use ($employee) {
                $response = $survey->is_anonymous
                    ? null
                    : EmployeeSurveyResponse::query()
                        ->where('employee_survey_id', $survey->id)
                        ->where('employee_id', $employee->id)
                        ->first();

                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'status' => $survey->status,
                    'is_anonymous' => (bool) $survey->is_anonymous,
                    'starts_at' => $survey->starts_at?->toIso8601String(),
                    'ends_at' => $survey->ends_at?->toIso8601String(),
                    'questions' => collect($survey->questions ?? [])
                        ->map(fn (array $question) => [
                            'id' => $question['id'] ?? null,
                            'question' => $question['question'] ?? '',
                            'type' => $question['type'] ?? 'text',
                        ])
                        ->values(),
                    'has_responded' => $response !== null,
                    'submitted_at' => $response?->submitted_at?->toIso8601String(),
                    'answers' => $response?->answers ?? [],
                ];
            })
            ->values();

        return $this->success([
            'items' => $surveys,
        ]);
    }

    public function submitSurvey(Request $request, EmployeeSurvey $survey): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        abort_unless($survey->status === 'active', 404);

        $validated = $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*' => ['nullable', 'string', 'max:2000'],
        ]);

        EmployeeSurveyResponse::query()->updateOrCreate(
            [
                'employee_survey_id' => $survey->id,
                'employee_id' => $survey->is_anonymous ? null : $employee->id,
            ],
            [
                'user_id' => $user->accountOwnerId(),
                'answers' => array_values($validated['answers']),
                'submitted_at' => now(),
            ],
        );

        return $this->success(null, 'Respons survey berhasil dikirim.');
    }

    public function assets(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $items = CompanyAssetAssignment::query()
            ->with('asset:id,asset_code,name,category,brand,model,serial_number,status')
            ->where('employee_id', $employee->id)
            ->latest('issued_at')
            ->latest('id')
            ->get()
            ->map(fn (CompanyAssetAssignment $assignment) => [
                'id' => $assignment->id,
                'asset' => $assignment->asset ? [
                    'id' => $assignment->asset->id,
                    'asset_code' => $assignment->asset->asset_code,
                    'name' => $assignment->asset->name,
                    'category' => $assignment->asset->category,
                    'brand' => $assignment->asset->brand,
                    'model' => $assignment->asset->model,
                    'serial_number' => $assignment->asset->serial_number,
                    'status' => $assignment->asset->status,
                ] : null,
                'issued_at' => $assignment->issued_at?->format('Y-m-d'),
                'returned_at' => $assignment->returned_at?->format('Y-m-d'),
                'condition_out' => $assignment->condition_out,
                'condition_in' => $assignment->condition_in,
                'notes' => $assignment->notes,
                'is_active' => $assignment->returned_at === null,
            ])
            ->values();

        return $this->success([
            'items' => $items,
        ]);
    }

    public function reprimands(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $employee = $this->resolveRequiredSelfServiceEmployee($user);

        $items = EmployeeReprimand::query()
            ->where('employee_id', $employee->id)
            ->latest('issued_date')
            ->latest('id')
            ->get()
            ->map(fn (EmployeeReprimand $reprimand) => [
                'id' => $reprimand->id,
                'reprimand_number' => $reprimand->reprimand_number,
                'level' => $reprimand->level,
                'issued_date' => $reprimand->issued_date?->format('Y-m-d'),
                'incident_date' => $reprimand->incident_date?->format('Y-m-d'),
                'subject' => $reprimand->subject,
                'description' => $reprimand->description,
                'action_plan' => $reprimand->action_plan,
                'status' => $reprimand->status,
                'resolution_notes' => $reprimand->resolution_notes,
            ])
            ->values();

        return $this->success([
            'items' => $items,
        ]);
    }
}
