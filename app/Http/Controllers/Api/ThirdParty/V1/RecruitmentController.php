<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RecruitmentController extends Controller
{
    use InteractsWithThirdPartyApi;

    /**
     * List job vacancies for the authenticated company account.
     */
    public function vacancies(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'published', 'closed'])],
            'search' => ['nullable', 'string', 'max:100'],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'employment_type' => ['nullable', Rule::in(['permanent', 'contract', 'internship', 'freelance'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = JobVacancy::query()
            ->where('user_id', $ownerId)
            ->with(['division:id,name', 'position:id,name'])
            ->withCount('applications')
            ->when(($validated['status'] ?? '') !== '', fn ($query) => $query->where('status', $validated['status']))
            ->when(($validated['search'] ?? '') !== '', function ($query) use ($validated): void {
                $search = $validated['search'];
                $query->where(function ($builder) use ($search): void {
                    $builder->where('title', 'like', '%'.$search.'%')
                        ->orWhere('location', 'like', '%'.$search.'%');
                });
            })
            ->when(isset($validated['division_id']), fn ($query) => $query->where('division_id', $validated['division_id']))
            ->when(($validated['employment_type'] ?? '') !== '', fn ($query) => $query->where('employment_type', $validated['employment_type']))
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return $this->paginated($paginator, fn (JobVacancy $vacancy) => [
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'slug' => $vacancy->slug,
            'employment_type' => $vacancy->employment_type,
            'workplace_type' => $vacancy->workplace_type,
            'location' => $vacancy->location,
            'openings' => $vacancy->openings,
            'min_salary' => $vacancy->min_salary !== null ? (float) $vacancy->min_salary : null,
            'max_salary' => $vacancy->max_salary !== null ? (float) $vacancy->max_salary : null,
            'status' => $vacancy->status,
            'applications_count' => $vacancy->applications_count,
            'closing_date' => $vacancy->closing_date?->format('Y-m-d'),
            'published_at' => $vacancy->published_at?->toIso8601String(),
            'division' => $vacancy->division ? [
                'id' => $vacancy->division->id,
                'name' => $vacancy->division->name,
            ] : null,
            'position' => $vacancy->position ? [
                'id' => $vacancy->position->id,
                'name' => $vacancy->position->name,
            ] : null,
            'apply_url' => route('careers.show', $vacancy->slug),
            'public_url' => route('careers.show', $vacancy->slug),
        ], 'Daftar lowongan kerja berhasil diambil.');
    }

    /**
     * Get single job vacancy detail for the authenticated company account.
     */
    public function showVacancy(Request $request, int $id): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $vacancy = JobVacancy::query()
            ->where('user_id', $ownerId)
            ->where('id', $id)
            ->with(['division:id,name', 'position:id,name'])
            ->withCount('applications')
            ->first();

        if (! $vacancy) {
            return $this->error('Lowongan kerja tidak ditemukan.', 404);
        }

        return $this->success([
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'slug' => $vacancy->slug,
            'employment_type' => $vacancy->employment_type,
            'workplace_type' => $vacancy->workplace_type,
            'location' => $vacancy->location,
            'openings' => $vacancy->openings,
            'min_salary' => $vacancy->min_salary !== null ? (float) $vacancy->min_salary : null,
            'max_salary' => $vacancy->max_salary !== null ? (float) $vacancy->max_salary : null,
            'description' => $vacancy->description,
            'requirements' => $vacancy->requirements,
            'benefits' => $vacancy->benefits,
            'status' => $vacancy->status,
            'applications_count' => $vacancy->applications_count,
            'closing_date' => $vacancy->closing_date?->format('Y-m-d'),
            'published_at' => $vacancy->published_at?->toIso8601String(),
            'division' => $vacancy->division ? [
                'id' => $vacancy->division->id,
                'name' => $vacancy->division->name,
            ] : null,
            'position' => $vacancy->position ? [
                'id' => $vacancy->position->id,
                'name' => $vacancy->position->name,
            ] : null,
            'apply_url' => route('careers.show', $vacancy->slug),
            'public_url' => route('careers.show', $vacancy->slug),
        ], 'Detail lowongan kerja berhasil diambil.');
    }

    /**
     * Create a job vacancy for the authenticated company account.
     */
    public function storeVacancy(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'employment_type' => ['nullable', Rule::in(['permanent', 'contract', 'internship', 'freelance'])],
            'workplace_type' => ['nullable', Rule::in(['onsite', 'hybrid', 'remote'])],
            'location' => ['nullable', 'string', 'max:160'],
            'openings' => ['required', 'integer', 'min:1', 'max:999'],
            'min_salary' => ['nullable', 'numeric', 'min:0'],
            'max_salary' => ['nullable', 'numeric', 'gte:min_salary'],
            'description' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'benefits' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(['draft', 'published', 'closed'])],
            'closing_date' => ['nullable', 'date'],
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (JobVacancy::query()->where('user_id', $ownerId)->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $vacancy = JobVacancy::query()->create([
            ...$validated,
            'user_id' => $ownerId,
            'slug' => $slug,
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return $this->success([
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'slug' => $vacancy->slug,
            'status' => $vacancy->status,
            'openings' => $vacancy->openings,
            'created_at' => $vacancy->created_at?->toIso8601String(),
        ], 'Lowongan kerja berhasil dibuat.', 201);
    }

    /**
     * Update a job vacancy for the authenticated company account.
     */
    public function updateVacancy(Request $request, int $id): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $vacancy = JobVacancy::query()->where('user_id', $ownerId)->where('id', $id)->first();
        if (! $vacancy) {
            return $this->error('Lowongan kerja tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'division_id' => ['nullable', 'integer', Rule::exists('divisions', 'id')->where('user_id', $ownerId)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('user_id', $ownerId)],
            'employment_type' => ['nullable', Rule::in(['permanent', 'contract', 'internship', 'freelance'])],
            'workplace_type' => ['nullable', Rule::in(['onsite', 'hybrid', 'remote'])],
            'location' => ['nullable', 'string', 'max:160'],
            'openings' => ['sometimes', 'required', 'integer', 'min:1', 'max:999'],
            'min_salary' => ['nullable', 'numeric', 'min:0'],
            'max_salary' => ['nullable', 'numeric', 'gte:min_salary'],
            'description' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'benefits' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', 'required', Rule::in(['draft', 'published', 'closed'])],
            'closing_date' => ['nullable', 'date'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published' && ! $vacancy->published_at) {
            $validated['published_at'] = now();
        }

        $vacancy->update($validated);

        return $this->success([
            'id' => $vacancy->id,
            'title' => $vacancy->title,
            'slug' => $vacancy->slug,
            'status' => $vacancy->status,
            'updated_at' => $vacancy->updated_at?->toIso8601String(),
        ], 'Lowongan kerja berhasil diperbarui.');
    }

    /**
     * List job applications for the authenticated company account.
     */
    public function applications(Request $request): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'job_vacancy_id' => ['nullable', 'integer', Rule::exists('job_vacancies', 'id')->where('user_id', $ownerId)],
            'stage' => ['nullable', Rule::in(['applied', 'screening', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'])],
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = JobApplication::query()
            ->where('user_id', $ownerId)
            ->with(['jobVacancy:id,title,slug,employment_type'])
            ->when(isset($validated['job_vacancy_id']), fn ($query) => $query->where('job_vacancy_id', $validated['job_vacancy_id']))
            ->when(($validated['stage'] ?? '') !== '', fn ($query) => $query->where('stage', $validated['stage']))
            ->when(($validated['search'] ?? '') !== '', function ($query) use ($validated): void {
                $search = $validated['search'];
                $query->where(function ($builder) use ($search): void {
                    $builder->where('full_name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%');
                });
            })
            ->when(isset($validated['date_from']), fn ($query) => $query->whereDate('created_at', '>=', $validated['date_from']))
            ->when(isset($validated['date_to']), fn ($query) => $query->whereDate('created_at', '<=', $validated['date_to']))
            ->orderByDesc('id')
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return $this->paginated($paginator, fn (JobApplication $app) => [
            'id' => $app->id,
            'job_vacancy' => $app->jobVacancy ? [
                'id' => $app->jobVacancy->id,
                'title' => $app->jobVacancy->title,
                'slug' => $app->jobVacancy->slug,
            ] : null,
            'full_name' => $app->full_name,
            'email' => $app->email,
            'phone' => $app->phone,
            'last_education' => $app->last_education,
            'years_experience' => $app->years_experience !== null ? (float) $app->years_experience : null,
            'current_company' => $app->current_company,
            'expected_salary' => $app->expected_salary !== null ? (float) $app->expected_salary : null,
            'stage' => $app->stage,
            'resume_url' => $app->resume_path ? asset('storage/'.$app->resume_path) : null,
            'applied_at' => $app->created_at?->toIso8601String(),
        ], 'Daftar lamaran kerja berhasil diambil.');
    }

    /**
     * Get single job application detail for the authenticated company account.
     */
    public function showApplication(Request $request, int $id): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $app = JobApplication::query()
            ->where('user_id', $ownerId)
            ->where('id', $id)
            ->with(['jobVacancy:id,title,slug,employment_type'])
            ->first();

        if (! $app) {
            return $this->error('Data lamaran tidak ditemukan.', 404);
        }

        return $this->success([
            'id' => $app->id,
            'job_vacancy' => $app->jobVacancy ? [
                'id' => $app->jobVacancy->id,
                'title' => $app->jobVacancy->title,
                'slug' => $app->jobVacancy->slug,
            ] : null,
            'full_name' => $app->full_name,
            'email' => $app->email,
            'phone' => $app->phone,
            'birth_date' => $app->birth_date?->format('Y-m-d'),
            'address' => $app->address,
            'last_education' => $app->last_education,
            'years_experience' => $app->years_experience !== null ? (float) $app->years_experience : null,
            'current_company' => $app->current_company,
            'take_home_pay_min' => $app->take_home_pay_min !== null ? (float) $app->take_home_pay_min : null,
            'take_home_pay_max' => $app->take_home_pay_max !== null ? (float) $app->take_home_pay_max : null,
            'expected_salary' => $app->expected_salary !== null ? (float) $app->expected_salary : null,
            'expected_join_date' => $app->expected_join_date?->format('Y-m-d'),
            'portfolio_url' => $app->portfolio_url,
            'linkedin_url' => $app->linkedin_url,
            'cover_letter' => $app->cover_letter,
            'resume_url' => $app->resume_path ? asset('storage/'.$app->resume_path) : null,
            'resume_original_name' => $app->resume_original_name,
            'stage' => $app->stage,
            'interview_scheduled_at' => $app->interview_scheduled_at?->toIso8601String(),
            'interviewed_at' => $app->interviewed_at?->toIso8601String(),
            'interview_notes' => $app->interview_notes,
            'recruiter_notes' => $app->recruiter_notes,
            'offered_salary' => $app->offered_salary !== null ? (float) $app->offered_salary : null,
            'proposed_start_date' => $app->proposed_start_date?->format('Y-m-d'),
            'applied_at' => $app->created_at?->toIso8601String(),
            'updated_at' => $app->updated_at?->toIso8601String(),
        ], 'Detail lamaran kerja berhasil diambil.');
    }

    /**
     * Update candidate application stage and notes for the authenticated company account.
     */
    public function updateStage(Request $request, int $id): JsonResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $app = JobApplication::query()->where('user_id', $ownerId)->where('id', $id)->first();
        if (! $app) {
            return $this->error('Data lamaran tidak ditemukan.', 404);
        }

        $validated = $request->validate([
            'stage' => ['required', Rule::in(['applied', 'screening', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'])],
            'interview_scheduled_at' => ['nullable', 'date'],
            'interviewed_at' => ['nullable', 'date'],
            'interview_notes' => ['nullable', 'string', 'max:5000'],
            'recruiter_notes' => ['nullable', 'string', 'max:5000'],
            'offered_salary' => ['nullable', 'numeric', 'min:0'],
            'proposed_start_date' => ['nullable', 'date'],
        ]);

        $app->update($validated);

        return $this->success([
            'id' => $app->id,
            'stage' => $app->stage,
            'interview_scheduled_at' => $app->interview_scheduled_at?->toIso8601String(),
            'interviewed_at' => $app->interviewed_at?->toIso8601String(),
            'updated_at' => $app->updated_at?->toIso8601String(),
        ], 'Status lamaran kerja berhasil diperbarui.');
    }
}
