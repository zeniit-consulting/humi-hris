<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSurvey;
use App\Models\EmployeeSurveyResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    private const QUESTION_TYPES = ['text', 'long_text', 'date', 'numeric', 'checkbox', 'radio'];

    private const OPTION_TYPES = ['checkbox', 'radio'];

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string'],
        ]);

        $filters = [
            'status' => $validated['status'] ?? '',
        ];

        $surveys = EmployeeSurvey::query()
            ->withCount('responses')
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->latest('starts_at')
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (EmployeeSurvey $survey) => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'questions' => collect($survey->questions ?? [])
                    ->map(fn (array $question) => [
                        'id' => $question['id'] ?? null,
                        'question' => $question['question'] ?? '',
                        'type' => $question['type'] ?? 'text',
                        'options' => array_values($question['options'] ?? []),
                    ])
                    ->values()
                    ->all(),
                'questions_text' => collect($survey->questions ?? [])->pluck('question')->implode("\n"),
                'status' => $survey->status,
                'is_anonymous' => $survey->is_anonymous,
                'starts_at' => $survey->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $survey->ends_at?->format('Y-m-d\TH:i'),
                'responses_count' => $survey->responses_count,
            ]);

        $employees = Employee::query()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name']);

        return Inertia::render('hris/surveys/index', [
            'surveys' => $surveys,
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'label' => $employee->employee_code.' - '.$employee->full_name,
            ]),
            'filters' => $filters,
            'statusOptions' => ['draft', 'active', 'closed'],
            'stats' => [
                'active' => EmployeeSurvey::query()->where('status', 'active')->count(),
                'responses' => EmployeeSurveyResponse::query()->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        EmployeeSurvey::query()->create($this->surveyPayload($request));

        return back();
    }

    public function update(Request $request, EmployeeSurvey $survey): RedirectResponse
    {
        $survey->update($this->surveyPayload($request));

        return back();
    }

    public function destroy(EmployeeSurvey $survey): RedirectResponse
    {
        $survey->delete();

        return back();
    }

    public function respond(Request $request, EmployeeSurvey $survey): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'employee_id' => [
                $survey->is_anonymous ? 'nullable' : 'required',
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
            'answers' => ['required', 'array', 'min:1'],
        ]);

        $answers = $validated['answers'];
        foreach ($survey->questions ?? [] as $index => $question) {
            $type = $question['type'] ?? 'text';
            $rules = in_array($type, ['checkbox'], true)
                ? ['nullable', 'array']
                : ($type === 'numeric'
                    ? ['nullable', 'numeric']
                    : ($type === 'date'
                        ? ['nullable', 'date_format:Y-m-d']
                        : ['nullable', 'string', 'max:2000']));

            $answer = $answers[$index] ?? null;
            validator(['answer' => $answer], ['answer' => $rules])->validate();

            if ($type === 'checkbox' && is_array($answer)) {
                validator(['answer' => $answer], ['answer.*' => ['string', 'max:2000']])->validate();
            } elseif ($type === 'radio' && $answer !== null && $answer !== '') {
                validator(['answer' => $answer], [
                    'answer' => [Rule::in(array_values($question['options'] ?? []))],
                ])->validate();
            }
        }

        EmployeeSurveyResponse::query()->updateOrCreate(
            [
                'employee_survey_id' => $survey->id,
                'employee_id' => $validated['employee_id'] ?? null,
            ],
            [
                'user_id' => $ownerId,
                'answers' => array_values($answers),
                'submitted_at' => now(),
            ],
        );

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function surveyPayload(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'questions' => ['nullable', 'array', 'min:1'],
            'questions.*.question' => ['required', 'string', 'max:500'],
            'questions.*.type' => ['required', Rule::in(self::QUESTION_TYPES)],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*' => ['string', 'max:255'],
            'questions_text' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(['draft', 'active', 'closed'])],
            'is_anonymous' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $questions = $validated['questions'] ?? null;

        if ($questions === null && filled($validated['questions_text'] ?? null)) {
            $questions = collect(preg_split('/\r\n|\r|\n/', $validated['questions_text']))
                ->map(fn (string $question) => trim($question))
                ->filter()
                ->values()
                ->map(fn (string $question) => [
                    'question' => $question,
                    'type' => 'text',
                ])
                ->all();
        }

        $questions = collect($questions ?? [])
            ->values()
            ->map(function (array $question, int $index): array {
                $type = $question['type'];
                $options = collect($question['options'] ?? [])
                    ->map(fn (string $option) => trim($option))
                    ->filter()
                    ->values()
                    ->all();

                if (in_array($type, self::OPTION_TYPES, true) && $options === []) {
                    throw ValidationException::withMessages([
                        "questions.{$index}.options" => 'Tambahkan minimal satu opsi jawaban.',
                    ]);
                }

                return [
                    'id' => 'q'.($index + 1),
                    'question' => trim($question['question']),
                    'type' => $type,
                    'options' => in_array($type, self::OPTION_TYPES, true) ? $options : [],
                ];
            })
            ->all();

        if ($questions === []) {
            throw ValidationException::withMessages([
                'questions_text' => 'Isi minimal satu pertanyaan survey.',
            ]);
        }

        return [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'questions' => $questions,
            'status' => $validated['status'],
            'is_anonymous' => (bool) ($validated['is_anonymous'] ?? false),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
        ];
    }
}
