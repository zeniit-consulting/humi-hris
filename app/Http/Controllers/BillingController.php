<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\PakasirPaymentGateway;
use App\Services\SubscriptionInvoicePdfService;
use App\Services\SubscriptionService;
use App\Services\SumopodPaymentGateway;
use App\Support\R2Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BillingController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected PakasirPaymentGateway $pakasir,
        protected SumopodPaymentGateway $sumopod,
        protected SubscriptionInvoicePdfService $invoicePdfService,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();

        $owner = $user->parent_user_id ? $user->parentUser : $user;

        $subscription = $this->subscriptionService->getLatestSubscription($owner);
        $employeeCount = $this->subscriptionService->getEmployeeCount($owner);
        $currentPlan = $subscription?->plan();

        $invoices = SubscriptionInvoice::query()
            ->where('user_id', $owner->id)
            ->orderByDesc('created_at')
            ->get();

        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price_per_employee')
            ->get();

        return Inertia::render('billing/index', [
            'billing_urls' => [
                'index' => $this->routePath('billing.index'),
                'invoice_store' => $this->routePath('billing.invoices.store'),
                'invoice_payment_template' => $this->routePath('billing.invoices.payment', ['invoice' => '__INVOICE_ID__']),
                'invoice_payment_check_template' => $this->routePath('billing.invoices.payment.check', ['invoice' => '__INVOICE_ID__']),
                'invoice_proof_template' => $this->routePath('billing.invoices.proof', ['invoice' => '__INVOICE_ID__']),
                'invoice_cancel_template' => $this->routePath('billing.invoices.cancel', ['invoice' => '__INVOICE_ID__']),
                'invoice_download_template' => $this->routePath('billing.invoices.download', ['invoice' => '__INVOICE_ID__']),
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan_slug' => $subscription->plan_slug,
                'status' => $subscription->status,
                'employee_count' => $employeeCount,
                'max_employees' => $currentPlan?->max_employees,
                'current_period_start' => $subscription->current_period_start?->toDateString(),
                'current_period_end' => $subscription->current_period_end?->toDateString(),
                'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
                'days_remaining' => $subscription->daysRemaining(),
                'locked_features' => $subscription->lockedFeatures(),
                'is_trial' => $subscription->status === 'trial',
            ] : null,
            'invoices' => $invoices->map(fn (SubscriptionInvoice $invoice): array => $this->serializeInvoice($invoice)),
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
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'payment_method' => ['nullable', 'string', 'in:'.implode(',', PakasirPaymentGateway::METHODS)],
        ]);
        $paymentMethod = $validated['payment_method'] ?? 'qris';

        /** @var User $user */
        $user = $request->user();
        $ownerId = $user->accountOwnerId();

        Log::info('billing.invoice.create.started', [
            'user_id' => $user->id,
            'owner_id' => $ownerId,
            'plan_slug' => $validated['plan_slug'],
            'payment_method' => $paymentMethod,
        ]);

        $activeEmployeeCount = $this->subscriptionService->getEmployeeCount($user);

        if ($this->subscriptionService->isDowngrade($user, $validated['plan_slug'])) {
            $this->subscriptionService->changePlanImmediately(
                $user,
                $validated['plan_slug'],
                $activeEmployeeCount,
            );

            SubscriptionInvoice::query()
                ->where('user_id', $ownerId)
                ->where('status', 'pending')
                ->where('plan_slug', '!=', $validated['plan_slug'])
                ->update(['status' => 'cancelled']);

            Log::info('billing.subscription.downgraded', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'plan_slug' => $validated['plan_slug'],
                'active_employee_count' => $activeEmployeeCount,
            ]);

            return redirect()->away($this->routePath('billing.index'))
                ->with('success', 'Paket berhasil diturunkan. Fitur di luar paket baru otomatis dikunci.');
        }

        $isQris = $paymentMethod === 'qris';
        $gateway = ($isQris && $this->sumopod->isConfigured()) ? 'sumopod' : 'pakasir';

        if ($gateway === 'pakasir' && ! $this->pakasir->isConfigured()) {
            Log::warning('billing.invoice.create.pakasir_not_configured', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
            ]);

            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Konfigurasi Pakasir belum lengkap. Isi PAKASIR_PROJECT dan PAKASIR_API_KEY.');
        }

        if ($gateway === 'sumopod' && ! $this->sumopod->isConfigured()) {
            Log::warning('billing.invoice.create.sumopod_not_configured', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
            ]);

            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Konfigurasi Sumopod belum lengkap. Isi SUMOPOD_API_KEY.');
        }

        if ($activeEmployeeCount < 1) {
            Log::warning('billing.invoice.create.no_active_employees', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'active_employee_count' => $activeEmployeeCount,
            ]);

            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Invoice belum dapat dibuat karena belum ada karyawan berstatus aktif.');
        }

        $existingInvoice = SubscriptionInvoice::query()
            ->where('user_id', $ownerId)
            ->where('plan_slug', $validated['plan_slug'])
            ->where('employee_count', $activeEmployeeCount)
            ->where('status', 'pending')
            ->where('payment_gateway', $gateway)
            ->where('payment_method', $paymentMethod)
            ->whereNotNull('payment_number')
            ->where(function ($query): void {
                $query
                    ->whereNull('payment_expires_at')
                    ->orWhere('payment_expires_at', '>', now());
            })
            ->latest('created_at')
            ->first();

        if ($existingInvoice) {
            Log::info('billing.invoice.create.reusing_pending_invoice', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'invoice_id' => $existingInvoice->id,
                'invoice_number' => $existingInvoice->invoice_number,
            ]);

            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $existingInvoice->id]))
                ->with('success', 'Invoice pending masih tersedia. Silakan lanjutkan pembayaran.');
        }

        try {
            $invoice = $this->subscriptionService->createInvoice(
                $user,
                $validated['plan_slug'],
                $activeEmployeeCount,
                $paymentMethod,
                $gateway,
            );
        } catch (\Throwable $exception) {
            Log::warning('billing.invoice.create.invoice_creation_failed', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'plan_slug' => $validated['plan_slug'],
                'active_employee_count' => $activeEmployeeCount,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            report($exception);

            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Invoice belum dapat dibuat. Pastikan paket langganan sudah tersedia dan coba lagi.');
        }

        if ($gateway === 'sumopod') {
            try {
                $response = $this->sumopod->createPayment($invoice);
                $this->sumopod->applyPaymentResponse($invoice, $response);
            } catch (\Throwable $exception) {
                Log::warning('billing.invoice.create.sumopod_failed', [
                    'user_id' => $user->id,
                    'owner_id' => $ownerId,
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'exception' => $exception::class,
                    'message' => $exception->getMessage(),
                ]);

                report($exception);
                $invoice->delete();

                return redirect()->away($this->routePath('billing.index'))
                    ->with('error', $exception->getMessage() ?: 'Transaksi Sumopod gagal dibuat. Silakan coba lagi atau hubungi admin.');
            }

            Log::info('billing.invoice.create.completed', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'payment_method' => $paymentMethod,
                'gateway' => 'sumopod',
            ]);

            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('success', 'Invoice Sumopod berhasil dibuat. Silakan selesaikan pembayaran QRIS.');
        }

        try {
            $response = $this->pakasir->createTransaction($invoice, $paymentMethod);
            $this->pakasir->applyTransactionResponse($invoice, $response);
        } catch (\Throwable $exception) {
            Log::warning('billing.invoice.create.failed', [
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            report($exception);
            $invoice->delete();

            return redirect()->away($this->routePath('billing.index'))
                ->with('error', $exception->getMessage() ?: 'Transaksi Pakasir gagal dibuat. Silakan coba lagi atau hubungi admin.');
        }

        Log::info('billing.invoice.create.completed', [
            'user_id' => $user->id,
            'owner_id' => $ownerId,
            'invoice_id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'payment_method' => $paymentMethod,
            'gateway' => 'pakasir',
        ]);

        return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
            ->with('success', 'Invoice Pakasir berhasil dibuat. Silakan selesaikan pembayaran QRIS.');
    }

    public function invoiceFallback(Request $request): RedirectResponse
    {
        $request->merge([
            'plan_slug' => $request->input('plan_slug', 'core'),
            'payment_method' => $request->input('payment_method', 'qris'),
        ]);

        return $this->createInvoice($request);
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

        if (! R2Storage::isConfigured()) {
            return back()
                ->withInput()
                ->withErrors(['payment_proof' => 'Cloudflare R2 belum dikonfigurasi lengkap. Isi R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, dan R2_ENDPOINT.']);
        }

        $path = R2Storage::disk()->putFile("billing/proofs/{$ownerId}", $request->file('payment_proof'));

        $invoice->update([
            'payment_proof' => $path,
            'notes' => $request->input('notes'),
        ]);

        return redirect()->away($this->routePath('billing.index'))
            ->with('success', 'Bukti pembayaran berhasil diupload. Kami akan verifikasi segera.');
    }

    public function payment(Request $request, int|string $invoice): InertiaResponse|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $ownerId = $user->accountOwnerId();

        $invoice = SubscriptionInvoice::query()
            ->whereKey($invoice)
            ->where('user_id', $ownerId)
            ->first();

        if (! $invoice) {
            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Invoice pembayaran tidak ditemukan. Silakan buat invoice baru.');
        }

        $paymentUrl = $invoice->payment_gateway === 'sumopod'
            ? $this->sumopod->paymentUrl($invoice)
            : $this->pakasir->paymentUrl($invoice);

        return Inertia::render('billing/payment', [
            'invoice' => $this->serializeInvoice($invoice),
            'payment_url' => $paymentUrl,
            'billing_url' => $this->routePath('billing.index'),
            'payment_check_url' => $this->routePath('billing.invoices.payment.check', ['invoice' => $invoice->id]),
            'download_url' => $this->routePath('billing.invoices.download', ['invoice' => $invoice->id]),
        ]);
    }

    public function checkPayment(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_if($invoice->user_id !== $user->accountOwnerId(), 403);

        if ($invoice->status === 'paid') {
            return redirect()->away($this->routePath('dashboard'))
                ->with('success', 'Pembayaran sudah terverifikasi. Akses sistem sudah aktif.');
        }

        if ($invoice->status !== 'pending') {
            return redirect()->away($this->routePath('billing.index'))
                ->with('error', 'Invoice tidak lagi dalam status menunggu pembayaran.');
        }

        if ($invoice->payment_gateway === 'sumopod') {
            return $this->checkSumopodPayment($invoice);
        }

        abort_if($invoice->payment_gateway !== 'pakasir', 422, 'Invoice ini bukan transaksi Pakasir.');

        return $this->checkPakasirPayment($invoice);
    }

    private function checkSumopodPayment(SubscriptionInvoice $invoice): RedirectResponse
    {
        try {
            $payload = $this->sumopod->checkPaymentStatus($invoice);
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('error', $exception->getMessage() ?: 'Status pembayaran belum dapat dicek.');
        }

        $data = Arr::get($payload, 'data', $payload);
        $invoice->update([
            'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                'status_check' => $payload,
            ]),
        ]);

        $status = Arr::get($data, 'status');
        if ($status !== 'completed') {
            $redirect = redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]));

            if (! $request->boolean('quiet') && ! $request->hasHeader('X-Auto-Poll')) {
                $redirect->with('error', 'Pembayaran belum terdeteksi selesai. Silakan tunggu beberapa saat lalu cek lagi.');
            }

            return $redirect;
        }

        $orderId = Arr::get($data, 'order_id');
        $amount = (int) Arr::get($data, 'amount');

        $amountMatches = ($amount === (int) $invoice->amount)
            || ($amount === (int) $invoice->total_payment)
            || (isset($data['net_amount']) && (int) $data['net_amount'] === (int) $invoice->amount);

        if (! $amountMatches || ($orderId && (string) $orderId !== (string) $invoice->invoice_number)) {
            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('error', 'Data pembayaran dari Sumopod tidak sesuai dengan invoice.');
        }

        $completedAtRaw = Arr::get($data, 'completed_at') ?? Arr::get($data, 'paid_at');
        $completedAt = filled($completedAtRaw)
            ? Carbon::parse((string) $completedAtRaw)
            : now();

        $fee = (int) (Arr::get($data, 'fee') ?? $invoice->payment_fee ?? 0);
        $totalPayment = Arr::has($data, 'total_payment')
            ? (int) Arr::get($data, 'total_payment')
            : ($invoice->total_payment ?: $amount);

        $invoice->update([
            'payment_fee' => $fee,
            'total_payment' => $totalPayment,
        ]);

        $this->subscriptionService->activateSubscription($invoice->refresh(), $completedAt);

        return redirect()->away($this->routePath('dashboard'))
            ->with('success', 'Pembayaran berhasil diverifikasi. Akses sistem sudah aktif.');
    }

    private function checkPakasirPayment(SubscriptionInvoice $invoice): RedirectResponse
    {
        try {
            $payload = $this->pakasir->transactionDetail($invoice);
        } catch (\Throwable $exception) {
            report($exception);

            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('error', $exception->getMessage() ?: 'Status pembayaran belum dapat dicek.');
        }

        $transaction = Arr::get($payload, 'transaction', []);
        $invoice->update([
            'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                'transaction_detail' => $transaction,
            ]),
        ]);

        if (Arr::get($transaction, 'status') !== 'completed') {
            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('error', 'Pembayaran belum terdeteksi selesai. Silakan tunggu beberapa saat lalu cek lagi.');
        }

        if ((int) Arr::get($transaction, 'amount') !== $invoice->amount
            || (string) Arr::get($transaction, 'order_id') !== $invoice->invoice_number) {
            return redirect()->away($this->routePath('billing.invoices.payment', ['invoice' => $invoice->id]))
                ->with('error', 'Data pembayaran dari Pakasir tidak sesuai dengan invoice.');
        }

        $completedAt = filled(Arr::get($transaction, 'completed_at'))
            ? Carbon::parse((string) Arr::get($transaction, 'completed_at'))
            : now();

        $this->subscriptionService->activateSubscription($invoice->refresh(), $completedAt);

        return redirect()->away($this->routePath('dashboard'))
            ->with('success', 'Pembayaran berhasil diverifikasi. Akses sistem sudah aktif.');
    }

    public function cancelInvoice(Request $request, SubscriptionInvoice $invoice): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $ownerId = $user->accountOwnerId();

        abort_if($invoice->user_id !== $ownerId, 403);
        abort_if($invoice->status !== 'pending', 422, 'Hanya invoice dengan status pending yang dapat dibatalkan.');

        $invoice->update(['status' => 'cancelled']);

        return redirect()->away($this->routePath('billing.index'))
            ->with('success', 'Invoice berhasil dibatalkan.');
    }

    public function downloadInvoice(Request $request, SubscriptionInvoice $invoice): Response
    {
        /** @var User $user */
        $user = $request->user();
        $ownerId = $user->accountOwnerId();

        abort_if($invoice->user_id !== $ownerId, 403);

        return $this->invoicePdfService->download($invoice);
    }

    private function routePath(string $name, array $parameters = []): string
    {
        return route($name, $parameters, false);
    }

    private function serializeInvoice(SubscriptionInvoice $invoice): array
    {
        $paymentUrl = $invoice->payment_gateway === 'sumopod'
            ? $this->sumopod->paymentUrl($invoice)
            : $this->pakasir->paymentUrl($invoice);

        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'plan_slug' => $invoice->plan_slug,
            'amount' => $invoice->amount,
            'employee_count' => $invoice->employee_count,
            'status' => $invoice->status,
            'payment_gateway' => $invoice->payment_gateway,
            'payment_method' => $invoice->payment_method,
            'payment_number' => $invoice->payment_number,
            'payment_fee' => $invoice->payment_fee,
            'total_payment' => $invoice->total_payment,
            'payment_expires_at' => $invoice->payment_expires_at?->toIso8601String(),
            'due_date' => $invoice->due_date?->toDateString(),
            'paid_at' => $invoice->paid_at?->toIso8601String(),
            'payment_proof' => R2Storage::url($invoice->payment_proof),
            'payment_url' => $paymentUrl,
            'is_sandbox' => $invoice->payment_gateway === 'sumopod'
                ? (Arr::get($invoice->payment_payload ?? [], '_environment') === 'sandbox' || Str::contains((string) ($invoice->payment_payload['payment_link_url'] ?? ''), 'sandbox') || $this->sumopod->isSandbox())
                : false,
            'notes' => $invoice->notes,
            'created_at' => $invoice->created_at?->toIso8601String(),
        ];
    }
}
