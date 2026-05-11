<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SubscriberManagementController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizeAccess($request);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'plan' => ['nullable', 'string', 'in:all,free,core,plus'],
            'status' => ['nullable', 'string', 'in:all,trial,active,expired,cancelled,none'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $plan = $filters['plan'] ?? 'all';
        $status = $filters['status'] ?? 'all';

        $subscribersQuery = User::query()
            ->where('role', 'admin')
            ->whereNull('parent_user_id')
            ->with('subscription')
            ->withCount('subUsers')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                });
            });

        $subscribers = $subscribersQuery
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $user): array {
                $subscription = $user->subscription;
                $company = CompanySetting::query()
                    ->where('user_id', $user->id)
                    ->value('name');
                $activeEmployees = Employee::query()
                    ->where('user_id', $user->id)
                    ->where('employment_status', 'active')
                    ->count();
                $latestInvoice = SubscriptionInvoice::query()
                    ->where('user_id', $user->id)
                    ->latest('created_at')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company_name' => $user->company_name ?: $company,
                    'created_at' => optional($user->created_at)?->toDateTimeString(),
                    'sub_users_count' => $user->sub_users_count ?? 0,
                    'active_employees_count' => $activeEmployees,
                    'subscription' => $subscription ? [
                        'id' => $subscription->id,
                        'plan_slug' => $subscription->plan_slug,
                        'status' => $subscription->status,
                        'employee_count' => $subscription->employee_count,
                        'current_period_start' => $subscription->current_period_start?->toDateString(),
                        'current_period_end' => $subscription->current_period_end?->toDateString(),
                        'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
                        'days_remaining' => $subscription->daysRemaining(),
                    ] : null,
                    'latest_invoice' => $latestInvoice ? [
                        'id' => $latestInvoice->id,
                        'invoice_number' => $latestInvoice->invoice_number,
                        'plan_slug' => $latestInvoice->plan_slug,
                        'status' => $latestInvoice->status,
                        'amount' => $latestInvoice->amount,
                        'employee_count' => $latestInvoice->employee_count,
                        'paid_at' => $latestInvoice->paid_at?->toDateTimeString(),
                        'due_date' => $latestInvoice->due_date?->toDateString(),
                        'payment_proof' => $latestInvoice->payment_proof
                            ? Storage::disk('r2')->url($latestInvoice->payment_proof)
                            : null,
                    ] : null,
                ];
            })
            ->filter(function (array $subscriber) use ($plan, $status): bool {
                $subscription = $subscriber['subscription'];
                $subscriptionPlan = $subscription['plan_slug'] ?? null;
                $subscriptionStatus = $subscription['status'] ?? 'none';

                if ($plan !== 'all' && $subscriptionPlan !== $plan) {
                    return false;
                }

                if ($status !== 'all' && $subscriptionStatus !== $status) {
                    return false;
                }

                return true;
            })
            ->values();

        $pendingInvoices = SubscriptionInvoice::query()
            ->where('status', 'pending')
            ->with('user:id,name,email,company_name')
            ->latest('created_at')
            ->get()
            ->map(fn (SubscriptionInvoice $invoice): array => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'user_id' => $invoice->user_id,
                'subscriber_name' => $invoice->user?->name,
                'subscriber_email' => $invoice->user?->email,
                'company_name' => $invoice->user?->company_name,
                'plan_slug' => $invoice->plan_slug,
                'amount' => $invoice->amount,
                'employee_count' => $invoice->employee_count,
                'due_date' => $invoice->due_date?->toDateString(),
                'created_at' => $invoice->created_at?->toDateTimeString(),
                'payment_proof' => $invoice->payment_proof
                    ? Storage::disk('r2')->url($invoice->payment_proof)
                    : null,
                'notes' => $invoice->notes,
            ]);

        $stats = [
            'total_subscribers' => $subscribers->count(),
            'active_subscribers' => $subscribers->where('subscription.status', 'active')->count(),
            'trial_subscribers' => $subscribers->where('subscription.status', 'trial')->count(),
            'expired_subscribers' => $subscribers->where('subscription.status', 'expired')->count(),
            'pending_invoices' => $pendingInvoices->count(),
        ];

        return Inertia::render('admin/subscribers/index', [
            'filters' => [
                'search' => $search,
                'plan' => $plan,
                'status' => $status,
            ],
            'stats' => $stats,
            'subscribers' => $subscribers,
            'pendingInvoices' => $pendingInvoices,
            'plans' => SubscriptionPlan::query()
                ->where('is_active', true)
                ->orderBy('price_per_employee')
                ->get(['slug', 'name', 'price_per_employee']),
        ]);
    }

    public function updateSubscription(Request $request, User $subscriber): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_unless($subscriber->role === 'admin' && $subscriber->parent_user_id === null, 404);

        $validated = $request->validate([
            'plan_slug' => ['required', 'string', 'in:free,core,plus'],
            'status' => ['required', 'string', 'in:trial,active,expired,cancelled'],
            'employee_count' => ['required', 'integer', 'min:0'],
            'current_period_start' => ['required', 'date'],
            'current_period_end' => ['required', 'date', 'after_or_equal:current_period_start'],
            'trial_ends_at' => ['nullable', 'date'],
        ]);

        Subscription::query()->updateOrCreate(
            ['user_id' => $subscriber->id],
            [
                'plan_slug' => $validated['plan_slug'],
                'status' => $validated['status'],
                'employee_count' => (int) $validated['employee_count'],
                'current_period_start' => $validated['current_period_start'],
                'current_period_end' => $validated['current_period_end'],
                'trial_ends_at' => $validated['trial_ends_at'],
            ],
        );

        return redirect()->route('admin.subscribers.index')
            ->with('success', 'Subscription subscriber berhasil diperbarui.');
    }

    public function approveInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice pending yang dapat di-approve.');

        $this->subscriptionService->activateSubscription($invoice);

        return redirect()->route('admin.subscribers.index')
            ->with('success', 'Invoice berhasil di-approve dan subscription diaktifkan.');
    }

    public function cancelInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice pending yang dapat dibatalkan.');

        $invoice->update(['status' => 'cancelled']);

        return redirect()->route('admin.subscribers.index')
            ->with('success', 'Invoice subscriber berhasil dibatalkan.');
    }

    private function authorizeAccess(Request $request): void
    {
        abort_unless($request->user()?->isSuperAdmin(), 403);
    }
}
