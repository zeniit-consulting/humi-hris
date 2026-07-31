<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeSurvey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyQuestionTypesTest extends TestCase
{
    use RefreshDatabase;

    public function test_survey_can_store_multiple_google_form_question_types(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('hris.surveys.store'), [
            'title' => 'Evaluasi onboarding',
            'description' => 'Masukan karyawan baru.',
            'questions' => [
                ['question' => 'Nama lengkap', 'type' => 'text'],
                ['question' => 'Ceritakan pengalamanmu', 'type' => 'long_text'],
                ['question' => 'Tanggal mulai', 'type' => 'date'],
                ['question' => 'Nilai onboarding', 'type' => 'numeric'],
                ['question' => 'Fasilitas yang digunakan', 'type' => 'checkbox', 'options' => ['Laptop', 'Akun email']],
                ['question' => 'Status onboarding', 'type' => 'radio', 'options' => ['Selesai', 'Berjalan']],
            ],
            'status' => 'draft',
            'is_anonymous' => false,
        ])->assertRedirect();

        $survey = EmployeeSurvey::query()->firstOrFail();

        $this->assertCount(6, $survey->questions);
        $this->assertSame(['Laptop', 'Akun email'], $survey->questions[4]['options']);
        $this->assertSame('radio', $survey->questions[5]['type']);
    }

    public function test_portal_api_returns_options_and_accepts_typed_answers(): void
    {
        $owner = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => 'survey-employee@example.test',
        ]);
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email' => $employee->email,
        ]);
        $survey = EmployeeSurvey::query()->create([
            'user_id' => $owner->id,
            'title' => 'Survey typed answers',
            'description' => null,
            'questions' => [
                ['id' => 'q1', 'question' => 'Tanggal', 'type' => 'date', 'options' => []],
                ['id' => 'q2', 'question' => 'Fasilitas', 'type' => 'checkbox', 'options' => ['Laptop', 'Akun email']],
                ['id' => 'q3', 'question' => 'Nilai', 'type' => 'numeric', 'options' => []],
            ],
            'status' => 'active',
            'is_anonymous' => false,
        ]);

        $this->actingAs($portalUser)
            ->get(route('portal.api.surveys.index'))
            ->assertOk()
            ->assertJsonPath('data.items.0.questions.1.options.0', 'Laptop');

        $this->actingAs($portalUser)
            ->postJson(route('portal.api.surveys.responses.store', $survey), [
                'answers' => ['2026-07-31', ['Laptop'], '8'],
            ])
            ->assertOk();

        $this->assertDatabaseHas('employee_survey_responses', [
            'employee_survey_id' => $survey->id,
            'employee_id' => $employee->id,
        ]);
    }
}
