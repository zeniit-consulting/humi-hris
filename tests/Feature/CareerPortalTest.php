<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\JobVacancy;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CareerPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_careers_page_only_shows_published_open_vacancies()
    {
        $this->withoutVite();

        $user = User::factory()->create();
        $division = Division::factory()->create([
            'user_id' => $user->id,
        ]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);

        JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Visible Vacancy',
            'slug' => 'visible-vacancy',
            'status' => 'published',
            'closing_date' => now()->addWeek()->toDateString(),
        ]);

        JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Draft Vacancy',
            'slug' => 'draft-vacancy',
            'status' => 'draft',
        ]);

        JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Expired Vacancy',
            'slug' => 'expired-vacancy',
            'status' => 'published',
            'closing_date' => now()->subDay()->toDateString(),
        ]);

        $response = $this->get(route('careers.index'));

        $response->assertOk();
        $response->assertSee('Visible Vacancy');
        $response->assertDontSee('Draft Vacancy');
        $response->assertDontSee('Expired Vacancy');
    }

    public function test_candidate_can_submit_application_from_public_vacancy_page()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $division = Division::factory()->create([
            'user_id' => $user->id,
        ]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);
        $vacancy = JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Frontend Engineer',
            'slug' => 'frontend-engineer',
            'status' => 'published',
            'closing_date' => now()->addWeeks(2)->toDateString(),
            'employment_type' => 'contract',
        ]);

        $response = $this->post(route('careers.apply', $vacancy->slug), [
            'full_name' => 'Sinta Maharani',
            'email' => 'sinta@example.com',
            'phone' => '081298765432',
            'birth_date' => '1999-08-17',
            'address' => 'Makassar',
            'last_education' => 'S1',
            'years_experience' => '3',
            'current_company' => 'PT Maju',
            'take_home_pay_min' => '5.500.000',
            'take_home_pay_max' => '6.000.000',
            'expected_salary' => '8.000.000',
            'expected_join_date' => '2026-08-03',
            'portfolio_url' => 'https://portfolio.example.com',
            'linkedin_url' => 'https://linkedin.com/in/sinta',
            'cover_letter' => 'Saya siap bergabung.',
            'resume' => UploadedFile::fake()->create(
                'cv-sinta.pdf',
                120,
                'application/pdf'
            ),
        ]);

        $response->assertRedirect(route('careers.show', $vacancy->slug));

        $this->assertDatabaseHas('job_applications', [
            'user_id' => $user->id,
            'job_vacancy_id' => $vacancy->id,
            'full_name' => 'Sinta Maharani',
            'phone' => '6281298765432',
            'stage' => 'applied',
            'employment_type' => 'contract',
            'take_home_pay_min' => '5500000.00',
            'take_home_pay_max' => '6000000.00',
            'expected_salary' => '8000000.00',
            'resume_original_name' => 'cv-sinta.pdf',
        ]);

        $this->assertSame(
            '2026-08-03',
            $vacancy->applications()->first()?->expected_join_date?->format('Y-m-d')
        );

        $this->assertNotNull($vacancy->applications()->first()?->resume_path);

        Storage::disk('public')->assertExists(
            (string) $vacancy->applications()->first()?->resume_path
        );
    }

    public function test_candidate_can_submit_application_with_current_salary(): void
    {
        $this->withoutVite();
        Storage::fake('public');

        $user = User::factory()->create();
        $division = Division::factory()->create(['user_id' => $user->id]);
        $position = Position::factory()->create(['user_id' => $user->id, 'division_id' => $division->id]);
        $vacancy = JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'status' => 'published',
            'closing_date' => now()->addWeeks(2)->toDateString(),
        ]);

        $response = $this->post(route('careers.apply', $vacancy->slug), [
            'full_name' => 'Budi Pratama',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'current_company' => 'PT Sumber Makmur',
            'current_salary' => '7.500.000',
            'expected_salary' => '9.000.000',
        ]);

        $response->assertRedirect(route('careers.show', $vacancy->slug));

        $this->assertDatabaseHas('job_applications', [
            'user_id' => $user->id,
            'job_vacancy_id' => $vacancy->id,
            'full_name' => 'Budi Pratama',
            'current_salary' => '7500000.00',
            'expected_salary' => '9000000.00',
        ]);
    }

    public function test_public_career_page_respects_show_closing_date(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();
        $division = Division::factory()->create(['user_id' => $user->id]);
        $position = Position::factory()->create(['user_id' => $user->id, 'division_id' => $division->id]);

        $hiddenClosingVacancy = JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'Backend Architect',
            'slug' => 'backend-architect',
            'status' => 'published',
            'closing_date' => now()->addMonth()->toDateString(),
            'show_closing_date' => false,
        ]);

        $visibleClosingVacancy = JobVacancy::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'title' => 'UI/UX Designer',
            'slug' => 'ui-ux-designer',
            'status' => 'published',
            'closing_date' => now()->addMonth()->toDateString(),
            'show_closing_date' => true,
        ]);

        $responseHidden = $this->get(route('careers.show', $hiddenClosingVacancy->slug));
        $responseHidden->assertOk();
        $responseHidden->assertInertia(fn ($page) => $page
            ->component('careers/show')
            ->where('vacancy.show_closing_date', false)
            ->where('vacancy.closing_date', null)
        );

        $responseVisible = $this->get(route('careers.show', $visibleClosingVacancy->slug));
        $responseVisible->assertOk();
        $responseVisible->assertInertia(fn ($page) => $page
            ->component('careers/show')
            ->where('vacancy.show_closing_date', true)
            ->where('vacancy.closing_date', now()->addMonth()->toDateString())
        );
    }
}
