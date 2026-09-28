<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\DeviceDetector;
use App\Support\RoleRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPortalController extends Controller
{
    /**
     * Display the user portal page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Allow 'user' role or sub-admin staff who have an employee profile or accessing via mobile
        $canAccessPortal = $user->role === 'user'
            || ($user->isSubAdmin() && ($user->employee_id || DeviceDetector::isMobile($request)));

        if (! $canAccessPortal) {
            return redirect()->to(RoleRedirect::for($user, $request));
        }

        return Inertia::render('portal/index');
    }
}
