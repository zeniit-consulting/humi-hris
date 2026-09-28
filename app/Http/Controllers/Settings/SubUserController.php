<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreSubUserRequest;
use App\Http\Requests\Settings\UpdateSubUserRequest;
use App\Models\Employee;
use App\Models\SubCompany;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubUserController extends Controller
{
    /**
     * Display sub-user management page.
     */
    public function index(Request $request): Response
    {
        $admin = $this->resolveAdmin($request);

        $subUsers = User::query()
            ->with(['clientSubCompanies:id,code,name', 'employee:id,employee_code,first_name,last_name,email,phone'])
            ->where('parent_user_id', $admin->id)
            ->where('role', '!=', 'user')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'parent_user_id', 'employee_id', 'permissions', 'client_sub_company_id', 'created_at']);

        $subCompanies = SubCompany::query()
            ->where('user_id', $admin->id)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('user_id', $admin->id)
            ->where('is_active', true)
            ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'email', 'phone', 'sub_company_id']);

        $availableModules = [
            ['key' => 'attendances', 'label' => 'Absensi & Kehadiran', 'description' => 'Log Kehadiran, Kunjungan Klien, dan Approval Absensi'],
            ['key' => 'schedules', 'label' => 'Jadwal Kerja & Shift', 'description' => 'Jadwal Kerja, Roster Shift, dan Approval Tukar Shift'],
            ['key' => 'leaves', 'label' => 'Cuti & Izin', 'description' => 'Pengajuan Cuti, Saldo Cuti, Kebijakan, dan Approval Cuti'],
            ['key' => 'overtimes', 'label' => 'Lembur', 'description' => 'Pengajuan Lembur dan Approval Lembur'],
            ['key' => 'employees', 'label' => 'Data Karyawan & Organisasi', 'description' => 'Daftar Karyawan, Struktur Organisasi, Teguran, Rekrutmen'],
            ['key' => 'payrolls', 'label' => 'Payroll & Keuangan', 'description' => 'Penggajian, Kasbon, Reimbursement, Billing Klien, Laporan'],
            ['key' => 'operational', 'label' => 'Operasional', 'description' => 'Notifikasi Pengumuman, Survey, dan Aset Perusahaan'],
        ];

        return Inertia::render('settings/users', [
            'subUsers' => $subUsers->map(function (User $user) use ($subCompanies) {
                $subCompanyIds = $user->clientSubCompanies->pluck('id');

                if ($subCompanyIds->isEmpty() && $user->client_sub_company_id) {
                    $subCompanyIds = collect([(int) $user->client_sub_company_id]);
                }

                $subCompanyLabels = $user->clientSubCompanies;

                if ($subCompanyLabels->isEmpty() && $user->client_sub_company_id) {
                    $subCompanyLabels = $subCompanies->where('id', (int) $user->client_sub_company_id)->values();
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'employee_id' => $user->employee_id,
                    'employee_code' => $user->employee?->employee_code,
                    'employee_name' => $user->employee?->full_name,
                    'permissions' => $user->permissions,
                    'client_sub_company_id' => $user->client_sub_company_id,
                    'client_sub_company_ids' => $subCompanyIds->values(),
                    'client_sub_company_label' => $subCompanyLabels
                        ->map(fn (SubCompany $company) => $company->code.' - '.$company->name)
                        ->implode(', ') ?: null,
                    'created_at' => $user->created_at?->toIso8601String(),
                ];
            }),
            'subCompanies' => $subCompanies->map(fn (SubCompany $company) => [
                'id' => $company->id,
                'label' => $company->code.' - '.$company->name,
            ]),
            'employees' => $employees->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'code' => $employee->employee_code,
                'name' => $employee->full_name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'sub_company_id' => $employee->sub_company_id,
            ]),
            'availableModules' => $availableModules,
        ]);
    }

    /**
     * Store a newly created sub-user.
     */
    public function store(StoreSubUserRequest $request): RedirectResponse
    {
        $admin = $this->resolveAdmin($request);
        $validated = $request->validated();
        $subCompanyIds = collect($validated['client_sub_company_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $employeeId = ! empty($validated['employee_id']) ? (int) $validated['employee_id'] : null;
        $permissions = $validated['role'] === 'admin_staff' && isset($validated['permissions'])
            ? array_values((array) $validated['permissions'])
            : null;

        // Check if an existing user record exists for this employee or email under this admin
        $existingUser = null;
        if ($employeeId) {
            $existingUser = User::query()
                ->where('parent_user_id', $admin->id)
                ->where(function ($q) use ($employeeId, $validated) {
                    $q->where('employee_id', $employeeId)
                        ->orWhere('email', $validated['email']);
                })
                ->first();
        }

        if ($existingUser) {
            $existingUser->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'employee_id' => $employeeId,
                'permissions' => $permissions,
                'client_sub_company_id' => $subCompanyIds->first(),
            ]);

            if (! empty($validated['password'])) {
                $existingUser->password = $validated['password'];
            }

            $existingUser->save();
            $subUser = $existingUser;
        } else {
            $subUser = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => $validated['role'],
                'employee_id' => $employeeId,
                'permissions' => $permissions,
                'client_sub_company_id' => $subCompanyIds->first(),
                'parent_user_id' => $admin->id,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]);
        }

        $subUser->clientSubCompanies()->sync($subCompanyIds->all());

        return back()->with('success', 'Sub-user berhasil disimpan.');
    }

    /**
     * Update selected sub-user.
     */
    public function update(UpdateSubUserRequest $request, int $subUser): RedirectResponse
    {
        $admin = $this->resolveAdmin($request);
        $target = $this->findOwnedSubUser($admin->id, $subUser);
        $validated = $request->validated();
        $subCompanyIds = collect($validated['client_sub_company_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $employeeId = ! empty($validated['employee_id']) ? (int) $validated['employee_id'] : null;
        $permissions = $validated['role'] === 'admin_staff' && isset($validated['permissions'])
            ? array_values((array) $validated['permissions'])
            : null;

        $target->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'employee_id' => $employeeId,
            'permissions' => $permissions,
            'client_sub_company_id' => $subCompanyIds->first(),
        ]);

        if (! empty($validated['password'])) {
            $target->password = $validated['password'];
        }

        $target->save();
        $target->clientSubCompanies()->sync($subCompanyIds->all());

        return back()->with('success', 'Sub-user berhasil diperbarui.');
    }

    /**
     * Remove selected sub-user.
     */
    public function destroy(Request $request, int $subUser): RedirectResponse
    {
        $admin = $this->resolveAdmin($request);
        $target = $this->findOwnedSubUser($admin->id, $subUser);

        $target->delete();

        return back()->with('success', 'Sub-user berhasil dihapus.');
    }

    /**
     * Ensure authenticated user is an admin account owner.
     */
    private function resolveAdmin(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->canManageSubUsers(), 403);

        return $user;
    }

    /**
     * Find sub-user that belongs to current admin.
     */
    private function findOwnedSubUser(int $adminId, int $subUserId): User
    {
        return User::query()
            ->where('parent_user_id', $adminId)
            ->findOrFail($subUserId);
    }
}
