<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Carbon;

class SubscriptionService
{
    public const TRIAL_DAYS = 30;

    public function initializeFreeSubscription(User $user): Subscription
    {
        $today = Carbon::today();
        $trialEnd = $today->copy()->addDays(self::TRIAL_DAYS);

        return Subscription::query()->create([
            'user_id' => $user->id,
            'plan_slug' => 'free',
            'status' => 'trial',
            'employee_count' => 0,
            'current_period_start' => $today->toDateString(),
            'current_period_end' => $trialEnd->toDateString(),
            'trial_ends_at' => $trialEnd->toDateString(),
        ]);
    }

    public function getLatestSubscription(User $user): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $user->accountOwnerId())
            ->latest()
            ->first();
    }

    public function getActiveSubscription(User $user): ?Subscription
    {
        $ownerId = $user->accountOwnerId();

        $subscription = Subscription::query()
            ->where('user_id', $ownerId)
            ->latest()
            ->first();

        if ($subscription && $subscription->isActive()) {
            return $subscription;
        }

        return null;
    }

    public function createInvoice(User $user, string $planSlug, int $employeeCount): SubscriptionInvoice
    {
        $ownerId = $user->accountOwnerId();

        $plan = SubscriptionPlan::query()->where('slug', $planSlug)->firstOrFail();

        $amount = $plan->price_per_employee * $employeeCount;

        do {
            $invoiceNumber = SubscriptionInvoice::generateInvoiceNumber($ownerId);
        } while (SubscriptionInvoice::query()->where('invoice_number', $invoiceNumber)->exists());

        return SubscriptionInvoice::query()->create([
            'user_id' => $ownerId,
            'subscription_id' => null,
            'invoice_number' => $invoiceNumber,
            'amount' => $amount,
            'employee_count' => $employeeCount,
            'plan_slug' => $planSlug,
            'status' => 'pending',
            'due_date' => Carbon::today()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);
    }

    public function activateSubscription(SubscriptionInvoice $invoice): Subscription
    {
        $ownerId = $invoice->user_id;
        $today = Carbon::today();
        $periodEnd = $today->addMonth();

        $subscription = Subscription::query()->updateOrCreate(
            ['user_id' => $ownerId],
            [
                'plan_slug' => $invoice->plan_slug,
                'status' => 'active',
                'employee_count' => $invoice->employee_count,
                'current_period_start' => $today->toDateString(),
                'current_period_end' => $periodEnd->toDateString(),
                'trial_ends_at' => null,
            ]
        );

        $invoice->update([
            'subscription_id' => $subscription->id,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return $subscription;
    }

    public function checkAndExpireSubscriptions(): void
    {
        Subscription::query()
            ->whereIn('status', ['active', 'trial'])
            ->where('current_period_end', '<', Carbon::today()->toDateString())
            ->update(['status' => 'expired']);
    }

    public function getEmployeeCount(User $user): int
    {
        return Employee::query()
            ->where('user_id', $user->accountOwnerId())
            ->where('employment_status', 'active')
            ->count();
    }

    public function canAddEmployee(User $user): bool
    {
        $ownerId = $user->accountOwnerId();

        $owner = User::query()->findOrFail($ownerId);

        $subscription = $this->getActiveSubscription($owner);
        $planSlug = $subscription?->plan_slug ?? 'free';

        $plan = SubscriptionPlan::query()->where('slug', $planSlug)->first();

        if (! $plan || $plan->max_employees === null) {
            return true;
        }

        $currentCount = $this->getEmployeeCount($owner);

        return $currentCount < $plan->max_employees;
    }
}
