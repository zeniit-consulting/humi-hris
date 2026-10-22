<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Careers\StoreCareerApplicationRequest;
use App\Models\CompanySetting;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PublicCareerController extends Controller
{
    /**
     * Display public career vacancies for a specific company account.
     */
    public function index(Request $request, string $company): JsonResponse
    {
        $companyUser = $this->resolveCompany($company);
        $companySetting = CompanySetting::query()->where('user_id', $companyUser->id)->first();

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'employment_type' => ['nullable', Rule::in(['permanent', 'contract', 'internship', 'freelance'])],
            'workplace_type' => ['nullable', Rule::in(['onsite', 'hybrid', 'remote'])],
            'division_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $search = $validated['search'] ?? '';
        $employmentType = $validated['employment_type'] ?? '';
        $workplaceType = $validated['workplace_type'] ?? '';
        $divisionId = $validated['division_id'] ?? null;
        $perPage = (int) ($validated['per_page'] ?? 12);

        $paginator = JobVacancy::query()
            ->where('user_id', $companyUser->id)
            ->where('status', 'published')
            ->where(function ($query): void {
                $query->whereNull('closing_date')
                    ->orWhereDate('closing_date', '>=', now()->toDateString());
            })
            ->with(['division:id,name', 'position:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('title', 'like', '%'.$search.'%')
                        ->orWhere('location', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->when($employmentType !== '', fn ($query) => $query->where('employment_type', $employmentType))
            ->when($workplaceType !== '', fn ($query) => $query->where('workplace_type', $workplaceType))
            ->when($divisionId !== null, fn ($query) => $query->where('division_id', $divisionId))
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar lowongan karier berhasil dimuat.',
            'company' => $this->formatCompany($companyUser, $companySetting),
            'data' => [
                'items' => collect($paginator->items())->map(fn (JobVacancy $vacancy) => [
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
                    'apply_api_url' => route('api.v1.careers.apply', ['company' => $company, 'slug' => $vacancy->slug]),
                    'public_url' => route('careers.show', $vacancy->slug),
                ])->values(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * Display a specific career vacancy detail for a company account.
     */
    public function show(Request $request, string $company, string $slug): JsonResponse
    {
        $companyUser = $this->resolveCompany($company);
        $companySetting = CompanySetting::query()->where('user_id', $companyUser->id)->first();

        $vacancy = JobVacancy::query()
            ->where('user_id', $companyUser->id)
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where(function ($query): void {
                $query->whereNull('closing_date')
                    ->orWhereDate('closing_date', '>=', now()->toDateString());
            })
            ->with(['division:id,name', 'position:id,name'])
            ->first();

        if (! $vacancy) {
            return response()->json([
                'success' => false,
                'message' => 'Lowongan pekerjaan tidak ditemukan atau sudah ditutup.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail lowongan berhasil dimuat.',
            'company' => $this->formatCompany($companyUser, $companySetting),
            'data' => [
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
                'apply_api_url' => route('api.v1.careers.apply', ['company' => $company, 'slug' => $vacancy->slug]),
                'public_url' => route('careers.show', $vacancy->slug),
            ],
        ]);
    }

    /**
     * Submit candidate application for a specific vacancy of a company account.
     */
    public function apply(StoreCareerApplicationRequest $request, string $company, string $slug): JsonResponse
    {
        $companyUser = $this->resolveCompany($company);

        $vacancy = JobVacancy::query()
            ->where('user_id', $companyUser->id)
            ->where('slug', $slug)
            ->where('status', 'published')
            ->where(function ($query): void {
                $query->whereNull('closing_date')
                    ->orWhereDate('closing_date', '>=', now()->toDateString());
            })
            ->first();

        if (! $vacancy) {
            return response()->json([
                'success' => false,
                'message' => 'Lowongan pekerjaan tidak ditemukan atau sudah ditutup.',
            ], 404);
        }

        $validated = $request->validated();
        $resumePath = null;
        $resumeOriginalName = null;

        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('recruitment/resumes', 'public');
            $resumeOriginalName = $request->file('resume')->getClientOriginalName();
        }

        $application = JobApplication::query()->create([
            ...$validated,
            'user_id' => $companyUser->id,
            'job_vacancy_id' => $vacancy->id,
            'resume_path' => $resumePath,
            'resume_original_name' => $resumeOriginalName,
            'employment_type' => $vacancy->employment_type,
            'stage' => 'applied',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lamaran berhasil dikirim. Tim HR akan meninjau data Anda.',
            'data' => [
                'id' => $application->id,
                'vacancy_id' => $vacancy->id,
                'vacancy_title' => $vacancy->title,
                'full_name' => $application->full_name,
                'email' => $application->email,
                'stage' => $application->stage,
                'applied_at' => $application->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Resolve company account owner by ID or slug.
     */
    private function resolveCompany(string|int $company): User
    {
        $user = null;

        if (is_numeric($company)) {
            $user = User::query()
                ->where('id', (int) $company)
                ->whereNull('parent_user_id')
                ->first();
        }

        if (! $user) {
            $slug = Str::slug($company);

            // Match CompanySetting name
            $setting = CompanySetting::query()
                ->whereRaw("LOWER(REPLACE(name, ' ', '-')) = ?", [$slug])
                ->orWhere('name', 'like', str_replace('-', ' ', $slug))
                ->first();

            if ($setting) {
                $user = User::query()->where('id', $setting->user_id)->whereNull('parent_user_id')->first();
            }
        }

        if (! $user) {
            // Match User company_name
            $slug = Str::slug($company);
            $user = User::query()
                ->whereNull('parent_user_id')
                ->where(function ($q) use ($slug): void {
                    $q->whereRaw("LOWER(REPLACE(company_name, ' ', '-')) = ?", [$slug])
                        ->orWhere('company_name', 'like', str_replace('-', ' ', $slug));
                })
                ->first();
        }

        if (! $user) {
            abort(response()->json([
                'success' => false,
                'message' => 'Akun perusahaan tidak ditemukan.',
            ], 404));
        }

        return $user;
    }

    /**
     * Format company summary for public API response.
     *
     * @return array<string, mixed>
     */
    private function formatCompany(User $user, ?CompanySetting $setting): array
    {
        $name = $setting?->name ?: ($user->company_name ?: $user->name);

        return [
            'id' => $user->id,
            'name' => $name,
            'slug' => Str::slug($name),
            'details' => $setting?->details,
            'logo_url' => $setting?->logo_path ? asset('storage/'.$setting->logo_path) : null,
            'location' => [
                'name' => $setting?->location_name,
                'address' => $setting?->location_address,
            ],
        ];
    }
}
