<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\CareerTransition;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Position;
use App\Models\SubCompany;
use App\Services\CareerTransitionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CareerTransitionController extends Controller
{
    public function __construct(
        protected CareerTransitionService $transitionService
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $query = CareerTransition::query()
            ->with([
                'employee:id,first_name,last_name,employee_code,division_id,position_id,sub_company_id,base_salary,employment_status',
                'oldDivision:id,name',
                'newDivision:id,name',
                'oldPosition:id,name',
                'newPosition:id,name',
                'oldSubCompany:id,name',
                'newSubCompany:id,name',
                'firstApprover:id,name',
                'secondApprover:id,name',
                'rejectedBy:id,name',
                'createdBy:id,name',
            ])
            ->where('user_id', $ownerId)
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('transition_type')) {
            $query->where('transition_type', $request->input('transition_type'));
        }

        if ($request->filled('search')) {
            $search = '%' . trim((string) $request->input('search')) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('transition_number', 'like', $search)
                    ->orWhere('letter_number', 'like', $search)
                    ->orWhere('reason', 'like', $search)
                    ->orWhereHas('employee', function ($empQ) use ($search) {
                        $empQ->where('first_name', 'like', $search)
                            ->orWhere('last_name', 'like', $search)
                            ->orWhere('employee_code', 'like', $search);
                    });
            });
        }

        $transitions = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => CareerTransition::query()->where('user_id', $ownerId)->count(),
            'pending' => CareerTransition::query()->where('user_id', $ownerId)->where('status', CareerTransition::STATUS_PENDING)->count(),
            'approved' => CareerTransition::query()->where('user_id', $ownerId)->where('status', CareerTransition::STATUS_APPROVED)->count(),
            'applied' => CareerTransition::query()->where('user_id', $ownerId)->where('status', CareerTransition::STATUS_APPLIED)->count(),
        ];

        $employees = Employee::query()
            ->with(['division:id,name', 'position:id,name', 'subCompany:id,name'])
            ->where('user_id', $ownerId)
            ->whereNull('offboarded_at')
            ->orderBy('first_name')
            ->get([
                'id', 'first_name', 'last_name', 'employee_code',
                'division_id', 'position_id', 'sub_company_id',
                'employment_status', 'employment_type',
                'base_salary', 'daily_wage',
            ])
            ->map(fn (Employee $e) => [
                'id' => $e->id,
                'name' => $e->full_name,
                'employee_code' => $e->employee_code,
                'division_id' => $e->division_id,
                'division_name' => $e->division?->name,
                'position_id' => $e->position_id,
                'position_name' => $e->position?->name,
                'sub_company_id' => $e->sub_company_id,
                'sub_company_name' => $e->subCompany?->name,
                'employment_status' => $e->employment_status,
                'employment_type' => $e->employment_type,
                'base_salary' => (float) $e->base_salary,
                'daily_wage' => (float) $e->daily_wage,
            ]);

        $divisions = Division::query()
            ->where('user_id', $ownerId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $positions = Position::query()
            ->where('user_id', $ownerId)
            ->orderBy('name')
            ->get(['id', 'name', 'level']);

        $subCompanies = SubCompany::query()
            ->where('user_id', $ownerId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('hris/career-transitions/index', [
            'transitions' => $transitions,
            'stats' => $stats,
            'filters' => $request->only(['status', 'transition_type', 'search']),
            'employees' => $employees,
            'divisions' => $divisions,
            'positions' => $positions,
            'subCompanies' => $subCompanies,
            'transitionTypes' => CareerTransition::TRANSITION_TYPES,
            'statuses' => CareerTransition::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();

        $validated = $request->validate([
            'employee_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
            'transition_type' => [
                'required',
                'string',
                Rule::in(array_keys(CareerTransition::TRANSITION_TYPES)),
            ],
            'effective_date' => ['required', 'date'],
            'new_division_id' => [
                'nullable',
                'integer',
                Rule::exists('divisions', 'id')->where('user_id', $ownerId),
            ],
            'new_position_id' => [
                'nullable',
                'integer',
                Rule::exists('positions', 'id')->where('user_id', $ownerId),
            ],
            'new_sub_company_id' => [
                'nullable',
                'integer',
                Rule::exists('sub_companies', 'id')->where('user_id', $ownerId),
            ],
            'new_employment_status' => ['nullable', 'string', 'max:50'],
            'new_employment_type' => ['nullable', 'string', 'max:50'],
            'new_base_salary' => ['nullable', 'numeric', 'min:0'],
            'new_daily_wage' => ['nullable', 'numeric', 'min:0'],
            'reason' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'approval_levels' => ['nullable', 'integer', Rule::in([1, 2])],
            'letter_number' => ['nullable', 'string', 'max:100'],
            'sk_signer_name' => ['nullable', 'string', 'max:100'],
            'sk_signer_position' => ['nullable', 'string', 'max:100'],
            'attachment' => ['nullable', 'file', 'max:5120', 'mimes:pdf,png,jpg,jpeg,doc,docx'],
        ]);

        $this->transitionService->createProposal(
            $validated,
            $request->user(),
            $request->file('attachment')
        );

        return back()->with('success', 'Pengajuan mutasi/promosi jabatan berhasil diajukan dan masuk ke tahap review.');
    }

    public function approve(Request $request, CareerTransition $careerTransition): RedirectResponse
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        $notes = $request->input('notes');

        if ($careerTransition->approval_stage === 0) {
            $this->transitionService->approveLevel1($careerTransition, $request->user(), $notes);
            $message = $careerTransition->approval_levels === 1
                ? 'Pengajuan berhasil disetujui penuh dan Surat Keputusan (SK) resmi telah diterbitkan.'
                : 'Persetujuan Tingkat 1 berhasil. Pengajuan kini menunggu persetujuan akhir Tingkat 2.';
        } elseif ($careerTransition->approval_stage === 1) {
            $skOverrides = $request->only(['letter_number', 'sk_signer_name', 'sk_signer_position']);
            $this->transitionService->approveLevel2($careerTransition, $request->user(), $notes, $skOverrides);
            $message = 'Persetujuan Tingkat 2 selesai. Pengajuan telah disetujui penuh dan Surat Keputusan (SK) resmi telah diterbitkan.';
        } else {
            return back()->with('error', 'Pengajuan sudah disetujui.');
        }

        return back()->with('success', $message);
    }

    public function reject(Request $request, CareerTransition $careerTransition): RedirectResponse
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $this->transitionService->reject($careerTransition, $request->user(), (string) $request->input('reason'));

        return back()->with('success', 'Pengajuan mutasi/promosi jabatan berhasil ditolak.');
    }

    public function apply(Request $request, CareerTransition $careerTransition): RedirectResponse
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        $this->transitionService->applyToEmployee($careerTransition, $request->user());

        return back()->with('success', 'Perubahan jabatan berhasil diterapkan langsung ke data master karyawan dan riwayat karir.');
    }

    public function destroy(Request $request, CareerTransition $careerTransition): RedirectResponse
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        if ($careerTransition->status === CareerTransition::STATUS_APPLIED) {
            return back()->with('error', 'Pengajuan yang sudah diterapkan ke data karyawan tidak dapat dihapus.');
        }

        if ($careerTransition->attachment_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($careerTransition->attachment_path);
        }

        $careerTransition->delete();

        return back()->with('success', 'Data pengajuan mutasi/promosi berhasil dihapus.');
    }

    public function downloadSk(Request $request, CareerTransition $careerTransition): Response
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        return $this->transitionService->generateSkPdf($careerTransition);
    }

    public function previewSk(Request $request, CareerTransition $careerTransition): Response
    {
        abort_unless((int) $careerTransition->user_id === $request->user()->accountOwnerId(), 404);

        return $this->transitionService->previewSkPdf($careerTransition);
    }
}
