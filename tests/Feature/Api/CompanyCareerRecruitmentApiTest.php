<?php

namespace Tests\Feature\Api;

use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyCareerRecruitmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_career_api_returns_vacancies_for_specific_company(): void
    {
        $company1 = User::factory()->create([
            'role' => 'admin',
            'company_name' => 'Acme Corporation',
        ]);
        CompanySetting::query()->create([
            'user_id' => $company1->id,
            'name' => 'Acme Corp HQ',
            'details' => 'Innovative Tech Company',
            'location_name' => 'Jakarta HQ',
            'location_address' => 'Jl. Sudirman No. 1',
        ]);

        $company2 = User::factory()->create([
            'role' => 'admin',
            'company_name' => 'Beta Global',
        ]);

        // Vacancies for Company 1
        $vacancy1 = JobVacancy::factory()->create([
            'user_id' => $company1->id,
            'title' => 'Senior Backend Engineer',
            'slug' => 'senior-backend-engineer',
            'status' => 'published',
            'employment_type' => 'permanent',
            'workplace_type' => 'remote',
            'closing_date' => now()->addDays(30),
        ]);
        $vacancyDraft = JobVacancy::factory()->create([
            'user_id' => $company1->id,
            'title' => 'Draft Position',
            'slug' => 'draft-position',
            'status' => 'draft',
        ]);

        // Vacancy for Company 2 (should not appear in Company 1 API)
        $vacancyOther = JobVacancy::factory()->create([
            'user_id' => $company2->id,
            'title' => 'Marketing Specialist',
            'slug' => 'marketing-specialist',
            'status' => 'published',
        ]);

        // Access via company ID
        $responseId = $this->getJson(route('api.v1.careers.index', ['company' => $company1->id]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('company.id', $company1->id)
            ->assertJsonPath('company.name', 'Acme Corp HQ')
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.title', 'Senior Backend Engineer')
            ->assertJsonPath('data.items.0.apply_url', route('careers.show', $vacancy1->slug))
            ->assertJsonPath('data.items.0.apply_api_url', route('api.v1.careers.apply', ['company' => $company1->id, 'slug' => $vacancy1->slug]));

        // Access via company slug
        $responseSlug = $this->getJson(route('api.v1.careers.index', ['company' => 'acme-corp-hq']))
            ->assertOk()
            ->assertJsonPath('company.id', $company1->id)
            ->assertJsonPath('data.items.0.id', $vacancy1->id)
            ->assertJsonPath('data.items.0.apply_url', route('careers.show', $vacancy1->slug));

        // Access via alias route /careers/companies/{company}
        $this->getJson(route('api.careers.index', ['company' => $company1->id]))
            ->assertOk()
            ->assertJsonPath('company.id', $company1->id);
    }

    public function test_public_career_api_shows_single_vacancy_detail(): void
    {
        $company = User::factory()->create(['company_name' => 'Zenith Tech']);
        $vacancy = JobVacancy::factory()->create([
            'user_id' => $company->id,
            'title' => 'Frontend Developer',
            'slug' => 'frontend-developer',
            'status' => 'published',
            'description' => 'Build high-performance React applications.',
            'requirements' => 'Proficient in TypeScript and Tailwind.',
            'closing_date' => now()->addDays(15),
        ]);

        $this->getJson(route('api.v1.careers.show', ['company' => $company->id, 'slug' => 'frontend-developer']))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Frontend Developer')
            ->assertJsonPath('data.slug', 'frontend-developer')
            ->assertJsonPath('data.description', 'Build high-performance React applications.')
            ->assertJsonPath('data.apply_url', route('careers.show', 'frontend-developer'))
            ->assertJsonPath('data.apply_api_url', route('api.v1.careers.apply', ['company' => $company->id, 'slug' => 'frontend-developer']));

        // Non-existent slug returns 404
        $this->getJson(route('api.v1.careers.show', ['company' => $company->id, 'slug' => 'non-existent']))
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_public_career_api_allows_candidate_to_apply(): void
    {
        Storage::fake('public');

        $company = User::factory()->create(['company_name' => 'Mega Corp']);
        $vacancy = JobVacancy::factory()->create([
            'user_id' => $company->id,
            'title' => 'Product Designer',
            'slug' => 'product-designer',
            'status' => 'published',
            'employment_type' => 'permanent',
            'closing_date' => now()->addDays(20),
        ]);

        $resume = UploadedFile::fake()->create('cv-jane-doe.pdf', 500, 'application/pdf');

        $payload = [
            'full_name' => 'Jane Doe',
            'email' => 'jane.doe@example.com',
            'phone' => '081234567890',
            'expected_salary' => 12000000,
            'cover_letter' => 'Saya sangat tertarik dengan posisi ini.',
            'resume' => $resume,
        ];

        $response = $this->postJson(route('api.v1.careers.apply', ['company' => $company->id, 'slug' => 'product-designer']), $payload)
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.full_name', 'Jane Doe')
            ->assertJsonPath('data.vacancy_title', 'Product Designer');

        $this->assertDatabaseHas('job_applications', [
            'user_id' => $company->id,
            'job_vacancy_id' => $vacancy->id,
            'full_name' => 'Jane Doe',
            'email' => 'jane.doe@example.com',
            'stage' => 'applied',
        ]);
    }

    public function test_third_party_recruitment_api_manages_vacancies_and_applications(): void
    {
        $company = User::factory()->create(['company_name' => 'Enterprise Corp']);
        Sanctum::actingAs($company, ['third-party']);

        // 1. Create Vacancy
        $createResponse = $this->postJson(route('third-party.v1.recruitment.vacancies.store'), [
            'title' => 'DevOps Engineer',
            'employment_type' => 'permanent',
            'workplace_type' => 'hybrid',
            'location' => 'Bali HQ',
            'openings' => 2,
            'min_salary' => 15000000,
            'max_salary' => 25000000,
            'description' => 'Manage Kubernetes and CI/CD pipelines.',
            'status' => 'published',
        ])->assertCreated()->assertJsonPath('success', true);

        $vacancyId = $createResponse->json('data.id');

        // 2. List Vacancies
        $this->getJson(route('third-party.v1.recruitment.vacancies.index'))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.title', 'DevOps Engineer');

        // 3. Update Vacancy
        $this->putJson(route('third-party.v1.recruitment.vacancies.update', $vacancyId), [
            'openings' => 3,
            'status' => 'published',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('job_vacancies', [
            'id' => $vacancyId,
            'openings' => 3,
        ]);

        // 4. Create Application directly in DB
        $application = JobApplication::query()->create([
            'user_id' => $company->id,
            'job_vacancy_id' => $vacancyId,
            'full_name' => 'John Developer',
            'email' => 'john.dev@example.com',
            'phone' => '6281122334455',
            'stage' => 'applied',
        ]);

        // 5. List Applications
        $this->getJson(route('third-party.v1.recruitment.applications.index'))
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.full_name', 'John Developer');

        // 6. Get Single Application
        $this->getJson(route('third-party.v1.recruitment.applications.show', $application->id))
            ->assertOk()
            ->assertJsonPath('data.full_name', 'John Developer')
            ->assertJsonPath('data.job_vacancy.title', 'DevOps Engineer');

        // 7. Update Application Stage
        $this->putJson(route('third-party.v1.recruitment.applications.update-stage', $application->id), [
            'stage' => 'interview_scheduled',
            'interview_scheduled_at' => now()->addDays(2)->toIso8601String(),
            'recruiter_notes' => 'Kandidat memiliki pengalaman yang relevan.',
        ])->assertOk()
            ->assertJsonPath('data.stage', 'interview_scheduled');

        $this->assertDatabaseHas('job_applications', [
            'id' => $application->id,
            'stage' => 'interview_scheduled',
            'recruiter_notes' => 'Kandidat memiliki pengalaman yang relevan.',
        ]);
    }
}
