<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreSubUserRequest;
use App\Http\Requests\Settings\UpdateSubUserRequest;
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
            ->with('clientSubCompanies:id,code,name')
            ->where('parent_user_id', $admin->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'client_sub_company_id', 'created_at']);

        $subCompanies = SubCompany::query()
            ->where('user_id', $admin->id)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

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
        ]);
    }

    /**
     * Store a newly created sub-user.
     */
    public function store(StoreSubUserRequest $request): RedirectResponse
    {
        $admin = $this->resolveAdmin($request);
        $validated = $request->validated();
        $subCompanyIds = collect($validated['client_sub_company_ids'])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $subUser = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
            'client_sub_company_id' => $subCompanyIds->first(),
            'parent_user_id' => $admin->id,
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        $subUser->clientSubCompanies()->sync($subCompanyIds->all());

        return back()->with('success', 'Sub-user berhasil dibuat.');
    }

    /**
     * Update selected sub-user.
     */
    public function update(UpdateSubUserRequest $request, int $subUser): RedirectResponse
    {
        $admin = $this->resolveAdmin($request);
        $target = $this->findOwnedSubUser($admin->id, $subUser);
        $validated = $request->validated();
        $subCompanyIds = collect($validated['client_sub_company_ids'])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $target->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
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
     * Get sub-user that belongs to current admin.
     */
    private function findOwnedSubUser(int $adminId, int $subUserId): User
    {
        return User::query()
            ->where('parent_user_id', $adminId)
            ->where('id', $subUserId)
            ->firstOrFail();
    }
}
