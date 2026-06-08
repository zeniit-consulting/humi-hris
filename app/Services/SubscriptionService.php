<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\CarbonInterface;
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

    public function createInvoice(User $user, string $planSlug, int $employeeCount, ?string $paymentMethod = null): SubscriptionInvoice
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
            'payment_gateway' => $paymentMethod ? 'pakasir' : null,
            'payment_method' => $paymentMethod,
            'due_date' => Carbon::today()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);
    }

    public function isDowngrade(User $user, string $targetPlanSlug): bool
    {
        $subscription = $this->getActiveSubscription($user);

        if (! $subscription || $subscription->plan_slug === $targetPlanSlug) {
            return false;
        }

        $currentPlan = $subscription->plan();
        $targetPlan = SubscriptionPlan::query()->where('slug', $targetPlanSlug)->first();

        if (! $currentPlan || ! $targetPlan) {
            return false;
        }

        return $targetPlan->price_per_employee < $currentPlan->price_per_employee;
    }

    public function changePlanImmediately(User $user, string $planSlug, int $employeeCount): Subscription
    {
        $ownerId = $user->accountOwnerId();

        SubscriptionPlan::query()->where('slug', $planSlug)->firstOrFail();

        $subscription = $this->getActiveSubscription($user);

        if (! $subscription) {
            throw new \RuntimeException('Tidak ada langganan aktif untuk diubah.');
        }

        $subscription->update([
            'user_id' => $ownerId,
            'plan_slug' => $planSlug,
            'employee_count' => $employeeCount,
        ]);

        return $subscription->refresh();
    }

    public function activateSubscription(SubscriptionInvoice $invoice, ?CarbonInterface $paidAt = null): Subscription
    {
        $ownerId = $invoice->user_id;
        $today = Carbon::today();
        $periodEnd = $today->copy()->addMonth();

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
            'paid_at' => $paidAt ?? now(),
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
