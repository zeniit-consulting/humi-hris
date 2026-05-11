<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BillingController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();

        $owner = $user->parent_user_id ? $user->parentUser : $user;

        $subscription = $this->subscriptionService->getActiveSubscription($owner);
        $employeeCount = $this->subscriptionService->getEmployeeCount($owner);

        $invoices = SubscriptionInvoice::query()
            ->where('user_id', $owner->id)
            ->orderByDesc('created_at')
            ->get();

        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price_per_employee')
            ->get();

        return Inertia::render('billing/index', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan_slug' => $subscription->plan_slug,
                'status' => $subscription->status,
                'employee_count' => $subscription->employee_count,
                'current_period_start' => $subscription->current_period_start?->toDateString(),
                'current_period_end' => $subscription->current_period_end?->toDateString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
                'days_remaining' => $subscription->daysRemaining(),
                'locked_features' => $subscription->lockedFeatures(),
                'is_trial' => $subscription->status === 'trial',
            ] : null,
            'invoices' => $invoices->map(fn (SubscriptionInvoice $invoice): array => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'plan_slug' => $invoice->plan_slug,
                'amount' => $invoice->amount,
                'employee_count' => $invoice->employee_count,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date?->toDateString(),
                'paid_at' => $invoice->paid_at?->toDateTimeString(),
                'payment_proof' => $invoice->payment_proof
                    ? Storage::disk('r2')->url($invoice->payment_proof)
                    : null,
                'notes' => $invoice->notes,
                'created_at' => $invoice->created_at?->toDateTimeString(),
            ]),
            'plans' => $plans->map(fn (SubscriptionPlan $plan): array => [
                'slug' => $plan->slug,
                'name' => $plan->name,
                'price_per_employee' => $plan->price_per_employee,
                'max_employees' => $plan->max_employees,
                'max_months' => $plan->max_months,
                'locked_features' => $plan->locked_features ?? [],
            ]),
            'employee_count' => $employeeCount,
        ]);
    }

    public function createInvoice(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_slug' => ['required', 'string', 'in:core,plus'],
            'employee_count' => ['required', 'integer', 'min:1'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $this->subscriptionService->createInvoice(
            $user,
            $validated['plan_slug'],
            (int) $validated['employee_count'],
        );

        return redirect()->route('billing.index')
            ->with('success', 'Invoice berhasil dibuat. Silakan lakukan pembayaran dan upload bukti transfer.');
    }

    public function uploadProof(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $ownerId = $user->accountOwnerId();

        abort_if($invoice->user_id !== $ownerId, 403);
        abort_if($invoice->status !== 'pending', 422, 'Invoice ini tidak dalam status pending.');

        $request->validate([
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $path = $request->file('payment_proof')
            ->store("billing/proofs/{$ownerId}", 'r2');

        $invoice->update([
            'payment_proof' => $path,
            'notes' => $request->input('notes'),
        ]);

        return redirect()->route('billing.index')
            ->with('success', 'Bukti pembayaran berhasil diupload. Kami akan verifikasi segera.');
    }

    public function cancelInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $ownerId = $user->accountOwnerId();

        abort_if($invoice->user_id !== $ownerId, 403);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice dengan status pending yang dapat dibatalkan.');

        $invoice->update(['status' => 'cancelled']);

        return redirect()->route('billing.index')
            ->with('success', 'Invoice berhasil dibatalkan.');
    }
}
