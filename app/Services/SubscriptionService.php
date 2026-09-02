<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    public const TRIAL_DAYS = 30;

    public function __construct(
        protected ?PakasirPaymentGateway $pakasir = null,
    ) {
        $this->pakasir = $pakasir ?? app(PakasirPaymentGateway::class);
    }

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

    /**
     * Auto-generate proforma invoices with QRIS for subscriptions expiring in $days days (default H-7).
     *
     * @return array{generated: int, skipped: int, failed: int}
     */
    public function generateProformaInvoicesForExpiringSubscriptions(int $days = 7): array
    {
        $targetDate = Carbon::today()->addDays($days)->toDateString();

        $subscriptions = Subscription::query()
            ->with('user')
            ->whereIn('status', ['active', 'trial'])
            ->whereDate('current_period_end', $targetDate)
            ->orderBy('id')
            ->get();

        $stats = ['generated' => 0, 'skipped' => 0, 'failed' => 0];

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;
            if (! $user) {
                $stats['skipped']++;
                continue;
            }

            $ownerId = $user->accountOwnerId();
            $employeeCount = $this->getEmployeeCount($user);

            // Cannot bill if 0 employees
            if ($employeeCount < 1) {
                $stats['skipped']++;
                continue;
            }

            // Target plan slug: if trial/free, default to core; otherwise maintain current plan
            $targetPlanSlug = $subscription->plan_slug === 'free' ? 'core' : $subscription->plan_slug;

            // Check if there is already a valid pending invoice for this user and plan
            $existingInvoice = SubscriptionInvoice::query()
                ->where('user_id', $ownerId)
                ->where('plan_slug', $targetPlanSlug)
                ->where('status', 'pending')
                ->where(function ($query) {
                    $query->whereNull('payment_expires_at')
                        ->orWhere('payment_expires_at', '>', now());
                })
                ->latest('created_at')
                ->first();

            if ($existingInvoice) {
                $stats['skipped']++;
                continue;
            }

            try {
                $invoice = $this->createInvoice($user, $targetPlanSlug, $employeeCount, 'qris');

                // Set due date to the expiration date of the subscription
                $invoice->update([
                    'due_date' => $subscription->current_period_end?->toDateString() ?? Carbon::today()->addDays($days)->toDateString(),
                ]);

                // Auto-create QRIS transaction via Pakasir if configured
                if ($this->pakasir && $this->pakasir->isConfigured()) {
                    try {
                        $response = $this->pakasir->createTransaction($invoice, 'qris');
                        $this->pakasir->applyTransactionResponse($invoice, $response);
                    } catch (\Throwable $pe) {
                        Log::warning('subscription.proforma_invoice.pakasir_failed', [
                            'invoice_id' => $invoice->id,
                            'error' => $pe->getMessage(),
                        ]);
                    }
                }

                $stats['generated']++;
            } catch (\Throwable $e) {
                Log::error('subscription.proforma_invoice.failed', [
                    'subscription_id' => $subscription->id,
                    'user_id' => $ownerId,
                    'error' => $e->getMessage(),
                ]);
                $stats['failed']++;
            }
        }

        return $stats;
    }
}
