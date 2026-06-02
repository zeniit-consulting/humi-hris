<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\PakasirPaymentGateway;
use App\Services\SubscriptionService;
use App\Support\R2Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BillingController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService,
        protected PakasirPaymentGateway $pakasir,
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
            'invoices' => $invoices->map(fn (SubscriptionInvoice $invoice): array => [
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
                'payment_expires_at' => $invoice->payment_expires_at?->toDateTimeString(),
                'due_date' => $invoice->due_date?->toDateString(),
                'paid_at' => $invoice->paid_at?->toDateTimeString(),
                'payment_proof' => R2Storage::url($invoice->payment_proof),
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
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'payment_method' => ['nullable', 'string', 'in:'.implode(',', PakasirPaymentGateway::METHODS)],
        ]);
        $paymentMethod = $validated['payment_method'] ?? 'qris';

        /** @var User $user */
        $user = $request->user();

        if (! $this->pakasir->isConfigured()) {
            return redirect()->route('billing.index')
                ->with('error', 'Konfigurasi Pakasir belum lengkap. Isi PAKASIR_PROJECT dan PAKASIR_API_KEY.');
        }

        $activeEmployeeCount = $this->subscriptionService->getEmployeeCount($user);

        if ($activeEmployeeCount < 1) {
            return redirect()->route('billing.index')
                ->with('error', 'Invoice belum dapat dibuat karena belum ada karyawan berstatus aktif.');
        }

        $invoice = $this->subscriptionService->createInvoice(
            $user,
            $validated['plan_slug'],
            $activeEmployeeCount,
            $paymentMethod,
        );

        try {
            $response = $this->pakasir->createTransaction($invoice, $paymentMethod);
            $this->pakasir->applyTransactionResponse($invoice, $response);
        } catch (\Throwable $exception) {
            report($exception);
            $invoice->delete();

            return redirect()->route('billing.index')
                ->with('error', $exception->getMessage() ?: 'Transaksi Pakasir gagal dibuat. Silakan coba lagi atau hubungi admin.');
        }

        return redirect()->route('billing.index')
            ->with('success', 'Invoice Pakasir berhasil dibuat. Silakan lakukan pembayaran sesuai instruksi pada tabel invoice.');
    }

    public function invoiceFallback(): RedirectResponse
    {
        return redirect()->route('billing.index')
            ->with('error', 'Pembuatan invoice harus dilakukan dari tombol upgrade paket.');
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
