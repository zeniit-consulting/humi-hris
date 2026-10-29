<?php

namespace App\Http\Controllers\Hris;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\SubCompany;
use App\Models\SubCompanyAttendanceLocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SubCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $ownerId = $request->user()->accountOwnerId();

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'inactive'])],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $status = $filters['status'] ?? 'all';

        $subCompanies = SubCompany::query()
            ->with(['attendanceLocations' => fn ($query) => $query->orderByDesc('is_active')->orderBy('name')])
            ->withCount(['employees', 'attendanceLocations'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('contact_email', 'like', "%{$search}%");
                });
            })
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (SubCompany $subCompany): array => $this->serializeSubCompany($subCompany));

        return Inertia::render('hris/sub-companies/index', [
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'subCompanies' => $subCompanies,
            'stats' => [
                'total' => SubCompany::query()->where('user_id', $ownerId)->count(),
                'active' => SubCompany::query()->where('user_id', $ownerId)->where('is_active', true)->count(),
                'locations' => SubCompanyAttendanceLocation::query()->where('user_id', $ownerId)->count(),
                'outsourced_employees' => Employee::query()->whereNotNull('sub_company_id')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        $validated = $this->validateSubCompany($request, $ownerId);

        $this->persistCompany($request, $ownerId, $validated);

        return back()->with('success', 'Sub-company berhasil ditambahkan.');
    }

    public function update(Request $request, SubCompany $subCompany): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $subCompany->user_id === $ownerId, 404);

        $validated = $this->validateSubCompany($request, $ownerId, $subCompany->id);

        $this->persistCompany($request, $ownerId, $validated, $subCompany);

        return back()->with('success', 'Sub-company berhasil diperbarui.');
    }

    public function destroy(Request $request, SubCompany $subCompany): RedirectResponse
    {
        abort_unless((int) $subCompany->user_id === $request->user()->accountOwnerId(), 404);

        if ($subCompany->employees()->exists()) {
            return back()->with('error', 'Sub-company tidak bisa dihapus karena masih memiliki karyawan.');
        }

        $logoPath = $subCompany->logo_path;
        $subCompany->delete();
        if ($logoPath) {
            Storage::disk('public')->delete($logoPath);
        }

        return back()->with('success', 'Sub-company berhasil dihapus.');
    }

    public function storeLocation(Request $request, SubCompany $subCompany): RedirectResponse
    {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $subCompany->user_id === $ownerId, 404);

        $validated = $this->validateLocation($request);

        $subCompany->attendanceLocations()->create([
            ...$validated,
            'user_id' => $ownerId,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Lokasi absensi berhasil ditambahkan.');
    }

    public function updateLocation(
        Request $request,
        SubCompany $subCompany,
        SubCompanyAttendanceLocation $location,
    ): RedirectResponse {
        $ownerId = $request->user()->accountOwnerId();
        abort_unless((int) $subCompany->user_id === $ownerId, 404);
        abort_unless((int) $location->sub_company_id === (int) $subCompany->id, 404);

        $validated = $this->validateLocation($request);

        $location->update([
            ...$validated,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Lokasi absensi berhasil diperbarui.');
    }

    public function destroyLocation(
        Request $request,
        SubCompany $subCompany,
        SubCompanyAttendanceLocation $location,
    ): RedirectResponse {
        abort_unless((int) $subCompany->user_id === $request->user()->accountOwnerId(), 404);
        abort_unless((int) $location->sub_company_id === (int) $subCompany->id, 404);

        $location->delete();

        return back()->with('success', 'Lokasi absensi berhasil dihapus.');
    }

    private function persistCompany(Request $request, int $ownerId, array $validated, ?SubCompany $company = null): void
    {
        $oldPath = $company?->logo_path;
        $newPath = null;
        unset($validated['logo'], $validated['remove_logo']);

        try {
            DB::transaction(function () use ($request, $ownerId, $validated, $company, &$newPath): void {
                $company ??= new SubCompany;
                $company->fill([
                    ...$validated,
                    'user_id' => $ownerId,
                    'code' => strtoupper($validated['code']),
                    'is_active' => $request->boolean('is_active', true),
                ])->save();

                if ($request->hasFile('logo')) {
                    $newPath = $request->file('logo')->store("company-logos/{$ownerId}/sub-companies/{$company->id}", 'public');
                    if (! $newPath) {
                        throw ValidationException::withMessages(['logo' => 'Logo tidak dapat disimpan. Silakan coba lagi.']);
                    }
                    $company->update(['logo_path' => $newPath]);
                } elseif ($request->boolean('remove_logo')) {
                    $company->update(['logo_path' => null]);
                }
            });
        } catch (\Throwable $error) {
            if ($newPath) {
                Storage::disk('public')->delete($newPath);
            }
            throw $error;
        }

        if ($oldPath && ($newPath || $request->boolean('remove_logo'))) {
            Storage::disk('public')->delete($oldPath);
        }
    }

    private function validateSubCompany(Request $request, int $ownerId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'code' => [
                'required',
                'string',
                'max:30',
                'regex:/^[A-Za-z0-9_-]+$/',
                Rule::unique('sub_companies', 'code')->where('user_id', $ownerId)->ignore($ignoreId),
            ],
            'logo' => ['nullable', 'prohibited_if:remove_logo,true', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_logo' => ['sometimes', 'boolean'],
            'name' => ['required', 'string', 'max:150'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function validateLocation(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'min:10', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function serializeSubCompany(SubCompany $subCompany): array
    {
        return [
            'id' => $subCompany->id,
            'code' => $subCompany->code,
            'name' => $subCompany->name,
            'logo_url' => $subCompany->logo_path ? Storage::disk('public')->url($subCompany->logo_path) : null,
            'contact_person' => $subCompany->contact_person,
            'contact_phone' => $subCompany->contact_phone,
            'contact_email' => $subCompany->contact_email,
            'address' => $subCompany->address,
            'notes' => $subCompany->notes,
            'is_active' => $subCompany->is_active,
            'employees_count' => $subCompany->employees_count,
            'attendance_locations_count' => $subCompany->attendance_locations_count,
            'attendance_locations' => $subCompany->attendanceLocations->map(fn (SubCompanyAttendanceLocation $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'latitude' => (string) $location->latitude,
                'longitude' => (string) $location->longitude,
                'radius_meters' => $location->radius_meters,
                'is_active' => $location->is_active,
            ])->values(),
        ];
    }
}
