<?php

namespace App\Observers;

use App\Models\User;
use App\Services\DefaultWorkShiftService;
use App\Services\SubscriptionService;

class UserObserver
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected DefaultWorkShiftService $defaultWorkShifts,
    ) {}

    public function created(User $user): void
    {
        if ($user->role === 'admin' && $user->parent_user_id === null) {
            $this->subscriptionService->initializeFreeSubscription($user);
            $this->defaultWorkShifts->seedForOwner($user);
        }
    }
}
