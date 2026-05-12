<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\PlatformAuditLog;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\SubscriptionService;
use App\Support\R2Storage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'status' => ['nullable', 'string', 'in:all,trial,active,expired,cancelled,suspended,none'],
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
                    'suspended_at' => $user->suspended_at?->toDateTimeString(),
                    'suspension_reason' => $user->suspension_reason,
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
                        'payment_proof' => R2Storage::url($latestInvoice->payment_proof),
                    ] : null,
                ];
            })
            ->filter(function (array $subscriber) use ($plan, $status): bool {
                $subscription = $subscriber['subscription'];
                $subscriptionPlan = $subscription['plan_slug'] ?? null;
                $subscriptionStatus = $subscriber['suspended_at'] ? 'suspended' : ($subscription['status'] ?? 'none');

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
                'payment_proof' => R2Storage::url($invoice->payment_proof),
                'notes' => $invoice->notes,
            ]);

        $stats = [
            'total_subscribers' => $subscribers->count(),
            'active_subscribers' => $subscribers->where('subscription.status', 'active')->count(),
            'trial_subscribers' => $subscribers->where('subscription.status', 'trial')->count(),
            'expired_subscribers' => $subscribers->where('subscription.status', 'expired')->count(),
            'suspended_subscribers' => $subscribers->whereNotNull('suspended_at')->count(),
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

    public function invoices(Request $request): Response
    {
        $this->authorizeAccess($request);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'plan' => ['nullable', 'string', 'in:all,free,core,plus'],
            'status' => ['nullable', 'string', 'in:all,pending,paid,cancelled,expired'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $plan = $filters['plan'] ?? 'all';
        $status = $filters['status'] ?? 'all';

        $invoiceQuery = SubscriptionInvoice::query()
            ->with('user:id,name,email,company_name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('company_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($plan !== 'all', fn ($query) => $query->where('plan_slug', $plan))
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest('created_at');

        $invoices = $invoiceQuery
            ->paginate(15)
            ->withQueryString()
            ->through(fn (SubscriptionInvoice $invoice): array => $this->serializeInvoice($invoice));

        $stats = [
            'total_invoices' => SubscriptionInvoice::query()->count(),
            'pending_invoices' => SubscriptionInvoice::query()->where('status', 'pending')->count(),
            'paid_invoices' => SubscriptionInvoice::query()->where('status', 'paid')->count(),
            'cancelled_invoices' => SubscriptionInvoice::query()->where('status', 'cancelled')->count(),
            'paid_revenue' => SubscriptionInvoice::query()->where('status', 'paid')->sum('amount'),
        ];

        return Inertia::render('admin/invoices/index', [
            'filters' => [
                'search' => $search,
                'plan' => $plan,
                'status' => $status,
            ],
            'stats' => $stats,
            'invoices' => $invoices,
        ]);
    }

    public function auditLogs(Request $request): Response
    {
        $this->authorizeAccess($request);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'action' => ['nullable', 'string', 'max:80'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $action = trim((string) ($filters['action'] ?? ''));

        $logs = PlatformAuditLog::query()
            ->with([
                'actor:id,name,email',
                'targetUser:id,name,email,company_name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('description', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhereHas('actor', function ($actorQuery) use ($search): void {
                            $actorQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('targetUser', function ($targetQuery) use ($search): void {
                            $targetQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('company_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($action !== '', fn ($query) => $query->where('action', $action))
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlatformAuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'metadata' => $log->metadata ?? [],
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toDateTimeString(),
                'actor' => $log->actor ? [
                    'id' => $log->actor->id,
                    'name' => $log->actor->name,
                    'email' => $log->actor->email,
                ] : null,
                'target_user' => $log->targetUser ? [
                    'id' => $log->targetUser->id,
                    'name' => $log->targetUser->name,
                    'email' => $log->targetUser->email,
                    'company_name' => $log->targetUser->company_name,
                ] : null,
            ]);

        $actions = PlatformAuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('admin/audit-logs/index', [
            'filters' => [
                'search' => $search,
                'action' => $action,
            ],
            'logs' => $logs,
            'actions' => $actions,
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

        $before = $subscriber->subscription?->only([
            'plan_slug',
            'status',
            'employee_count',
            'current_period_start',
            'current_period_end',
            'trial_ends_at',
        ]);

        $subscription = Subscription::query()->updateOrCreate(
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

        $this->logAudit(
            $request,
            'subscription.updated',
            $subscriber,
            $subscription,
            sprintf('Subscription %s diperbarui.', $subscriber->company_name ?: $subscriber->name),
            [
                'before' => $before,
                'after' => $subscription->fresh()?->only([
                    'plan_slug',
                    'status',
                    'employee_count',
                    'current_period_start',
                    'current_period_end',
                    'trial_ends_at',
                ]),
            ],
        );

        return redirect()->route('admin.subscribers.index')
            ->with('success', 'Subscription subscriber berhasil diperbarui.');
    }

    public function approveInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice pending yang dapat di-approve.');

        $subscription = $this->subscriptionService->activateSubscription($invoice);
        $this->logAudit(
            $request,
            'invoice.approved',
            $invoice->user,
            $invoice,
            sprintf('Invoice %s di-approve.', $invoice->invoice_number),
            [
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'subscription_id' => $subscription->id,
            ],
        );

        return redirect()->back(fallback: route('admin.subscribers.index'))
            ->with('success', 'Invoice berhasil di-approve dan subscription diaktifkan.');
    }

    public function cancelInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice pending yang dapat dibatalkan.');

        $invoice->update(['status' => 'cancelled']);
        $this->logAudit(
            $request,
            'invoice.cancelled',
            $invoice->user,
            $invoice,
            sprintf('Invoice %s dibatalkan.', $invoice->invoice_number),
            [
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'plan_slug' => $invoice->plan_slug,
            ],
        );

        return redirect()->back(fallback: route('admin.subscribers.index'))
            ->with('success', 'Invoice subscriber berhasil dibatalkan.');
    }

    public function suspend(Request $request, User $subscriber): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_unless($subscriber->role === 'admin' && $subscriber->parent_user_id === null, 404);
        abort_if($subscriber->isSuspended(), 422, 'Subscriber sudah dalam status suspended.');

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $subscriber->update([
            'suspended_at' => now(),
            'suspension_reason' => $validated['reason'],
            'suspended_by' => $request->user()?->id,
        ]);

        $this->logAudit(
            $request,
            'subscriber.suspended',
            $subscriber,
            $subscriber,
            sprintf('Subscriber %s disuspend.', $subscriber->company_name ?: $subscriber->name),
            ['reason' => $validated['reason']],
        );

        return back()->with('success', 'Subscriber berhasil disuspend.');
    }

    public function reactivate(Request $request, User $subscriber): RedirectResponse
    {
        $this->authorizeAccess($request);
        abort_unless($subscriber->role === 'admin' && $subscriber->parent_user_id === null, 404);
        abort_unless($subscriber->isSuspended(), 422, 'Subscriber tidak sedang suspended.');

        $reason = $subscriber->suspension_reason;

        $subscriber->update([
            'suspended_at' => null,
            'suspension_reason' => null,
            'suspended_by' => null,
        ]);

        $this->logAudit(
            $request,
            'subscriber.reactivated',
            $subscriber,
            $subscriber,
            sprintf('Subscriber %s diaktifkan kembali.', $subscriber->company_name ?: $subscriber->name),
            ['previous_reason' => $reason],
        );

        return back()->with('success', 'Subscriber berhasil diaktifkan kembali.');
    }

    private function authorizeAccess(Request $request): void
    {
        abort_unless($request->user()?->isSuperAdmin(), 403);
    }

    private function serializeInvoice(SubscriptionInvoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'user_id' => $invoice->user_id,
            'subscriber_name' => $invoice->user?->name,
            'subscriber_email' => $invoice->user?->email,
            'company_name' => $invoice->user?->company_name,
            'plan_slug' => $invoice->plan_slug,
            'amount' => $invoice->amount,
            'employee_count' => $invoice->employee_count,
            'status' => $invoice->status,
            'due_date' => $invoice->due_date?->toDateString(),
            'paid_at' => $invoice->paid_at?->toDateTimeString(),
            'created_at' => $invoice->created_at?->toDateTimeString(),
            'payment_proof' => R2Storage::url($invoice->payment_proof),
            'notes' => $invoice->notes,
        ];
    }

    private function logAudit(
        Request $request,
        string $action,
        ?User $targetUser,
        Model $target,
        string $description,
        array $metadata = [],
    ): void {
        PlatformAuditLog::query()->create([
            'actor_user_id' => $request->user()?->id,
            'target_user_id' => $targetUser?->id,
            'target_type' => $target::class,
            'target_id' => $target->getKey(),
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
