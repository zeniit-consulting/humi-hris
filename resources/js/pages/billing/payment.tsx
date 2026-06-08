import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Copy,
    ExternalLink,
    QrCode,
    RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Invoice = {
    id: number;
    invoice_number: string;
    plan_slug: 'free' | 'core' | 'plus';
    employee_count: number;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    payment_method: string | null;
    payment_number: string | null;
    payment_fee: number;
    total_payment: number | null;
    payment_expires_at: string | null;
    payment_url: string | null;
};

type PageProps = {
    invoice: Invoice;
    payment_url: string | null;
    billing_url: string;
    payment_check_url: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing & Langganan', href: '/billing' },
    { title: 'Pembayaran', href: '#' },
];

const planLabels: Record<string, string> = {
    free: 'Free Trial',
    core: 'Basic',
    plus: 'Plus',
};

const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatDateTime(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function BillingPaymentPage() {
    const { invoice, payment_url, billing_url, payment_check_url } =
        usePage<PageProps>().props;
    const { post, processing } = useForm({});
    const qrisValue = invoice.payment_number ?? payment_url ?? '';
    const payableAmount = invoice.total_payment ?? invoice.amount;
    const isPaid = invoice.status === 'paid';

    const handleCopy = async () => {
        if (!qrisValue) return;

        await navigator.clipboard.writeText(qrisValue);
    };

    const handleCheckPayment = () => {
        post(payment_check_url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pembayaran ${invoice.invoice_number}`} />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <QrCode className="size-5 text-muted-foreground" />
                            <Badge variant={isPaid ? 'default' : 'secondary'}>
                                {isPaid ? 'Lunas' : 'Menunggu Pembayaran'}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Pembayaran Paket {planLabels[invoice.plan_slug]}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Invoice {invoice.invoice_number}
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={billing_url}>
                            <ArrowLeft className="mr-2 size-4" />
                            Kembali ke Billing
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bayar via QRIS</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {qrisValue ? (
                                <>
                                    <div className="flex justify-center rounded-lg border bg-white p-5">
                                        <QRCodeSVG
                                            value={qrisValue}
                                            size={280}
                                            marginSize={2}
                                            level="M"
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCopy}
                                        >
                                            <Copy className="mr-2 size-4" />
                                            Salin QRIS
                                        </Button>
                                        {payment_url && (
                                            <Button asChild>
                                                <a
                                                    href={payment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="mr-2 size-4" />
                                                    Buka Link Payment
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                                    QRIS belum tersedia. Silakan kembali ke
                                    billing dan buat ulang invoice.
                                </div>
                            )}

                            <Button
                                type="button"
                                className="w-full"
                                disabled={processing || isPaid}
                                onClick={handleCheckPayment}
                            >
                                {isPaid ? (
                                    <>
                                        <CheckCircle2 className="mr-2 size-4" />
                                        Pembayaran Sudah Lunas
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 size-4" />
                                        {processing
                                            ? 'Mengecek pembayaran...'
                                            : 'Saya sudah bayar'}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Tagihan</CardTitle>
                            <CardDescription>
                                Detail transaksi subscription Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Paket
                                </span>
                                <span className="font-medium">
                                    {planLabels[invoice.plan_slug]}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Karyawan aktif
                                </span>
                                <span className="font-medium">
                                    {invoice.employee_count}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Metode
                                </span>
                                <span className="font-medium uppercase">
                                    {invoice.payment_method ?? 'qris'}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Nominal
                                </span>
                                <span className="font-medium">
                                    {fmt.format(invoice.amount)}
                                </span>
                            </div>
                            {invoice.payment_fee > 0 && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        Fee
                                    </span>
                                    <span className="font-medium">
                                        {fmt.format(invoice.payment_fee)}
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-3">
                                <div className="flex justify-between gap-4">
                                    <span className="font-medium">Total</span>
                                    <span className="font-semibold">
                                        {fmt.format(payableAmount)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Berlaku sampai
                                </span>
                                <span className="text-right font-medium">
                                    {formatDateTime(invoice.payment_expires_at)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
