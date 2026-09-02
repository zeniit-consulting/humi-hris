<?php

namespace App\Services;

use App\Models\CompanySetting;
use App\Models\SubscriptionInvoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class SubscriptionInvoicePdfService
{
    public function download(SubscriptionInvoice $invoice): Response
    {
        $documentTitle = $this->documentTitle($invoice);

        return Pdf::loadView('billing.invoice_pdf', $this->viewData($invoice, $documentTitle))
            ->setPaper('a4')
            ->download($documentTitle);
    }

    public function output(SubscriptionInvoice $invoice): string
    {
        $documentTitle = $this->documentTitle($invoice);

        return Pdf::loadView('billing.invoice_pdf', $this->viewData($invoice, $documentTitle))
            ->setPaper('a4')
            ->output();
    }

    public function documentTitle(SubscriptionInvoice $invoice): string
    {
        return sprintf(
            'Invoice_%s_%s.pdf',
            $invoice->invoice_number,
            $invoice->status === 'paid' ? 'PAID' : 'PROFORMA',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function viewData(SubscriptionInvoice $invoice, string $documentTitle): array
    {
        $user = $invoice->user;
        $companySetting = CompanySetting::query()->where('user_id', $invoice->user_id)->first();

        $planLabels = [
            'free' => 'Free Trial',
            'core' => 'Basic Plan',
            'plus' => 'Plus Plan',
        ];

        $planName = $planLabels[$invoice->plan_slug] ?? strtoupper($invoice->plan_slug);

        $unitPrice = $invoice->employee_count > 0
            ? (int) round($invoice->amount / $invoice->employee_count)
            : $invoice->amount;

        return [
            'invoice' => $invoice,
            'user' => $user,
            'companySetting' => $companySetting,
            'documentTitle' => $documentTitle,
            'planName' => $planName,
            'unitPrice' => $unitPrice,
            'subtotal' => $invoice->amount,
            'paymentFee' => $invoice->payment_fee,
            'total' => $invoice->total_payment ?? $invoice->amount,
        ];
    }
}
