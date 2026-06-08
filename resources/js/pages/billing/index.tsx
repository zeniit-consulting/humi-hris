import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    Lock,
    Receipt,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDeviceDateTime } from '@/lib/utils';
import type { BreadcrumbItem, SubscriptionInfo } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Invoice = {
    id: number;
    invoice_number: string;
    plan_slug: 'free' | 'core' | 'plus';
    employee_count: number;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'cancelled';
    created_at: string;
    paid_at: string | null;
    payment_gateway: string | null;
    payment_method: PaymentMethod | null;
    payment_number: string | null;
    payment_fee: number;
    total_payment: number | null;
    payment_expires_at: string | null;
    payment_proof: string | null;
    payment_url: string | null;
};

type PageProps = {
    subscription: SubscriptionInfo | null;
    invoices: Invoice[];
    employee_count: number;
    billing_urls: {
        index: string;
        invoice_store: string;
        invoice_payment_template: string;
        invoice_payment_check_template: string;
        invoice_proof_template: string;
        invoice_cancel_template: string;
    };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing & Langganan', href: '/billing' },
];

const PRICE_CORE = 2900;
const PRICE_PLUS = 7500;

type PaymentMethod =
    | 'cimb_niaga_va'
    | 'bni_va'
    | 'qris'
    | 'sampoerna_va'
    | 'bnc_va'
    | 'maybank_va'
    | 'permata_va'
    | 'atm_bersama_va'
    | 'artha_graha_va'
    | 'bri_va';

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
    { value: 'qris', label: 'QRIS' },
    { value: 'bni_va', label: 'BNI Virtual Account' },
    { value: 'bri_va', label: 'BRI Virtual Account' },
    { value: 'permata_va', label: 'Permata Virtual Account' },
    { value: 'cimb_niaga_va', label: 'CIMB Niaga Virtual Account' },
    { value: 'maybank_va', label: 'Maybank Virtual Account' },
    { value: 'atm_bersama_va', label: 'ATM Bersama Virtual Account' },
    { value: 'sampoerna_va', label: 'Sampoerna Virtual Account' },
    { value: 'bnc_va', label: 'BNC Virtual Account' },
    { value: 'artha_graha_va', label: 'Artha Graha Virtual Account' },
];

const planLabels: Record<string, string> = {
    free: 'Free Trial',
    core: 'Basic',
    plus: 'Plus',
};

const statusConfig: Record<
    Invoice['status'],
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    pending: { label: 'Menunggu Pembayaran', variant: 'secondary' },
    paid: { label: 'Lunas', variant: 'default' },
    expired: { label: 'Kedaluwarsa', variant: 'destructive' },
    cancelled: { label: 'Dibatalkan', variant: 'outline' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function paymentMethodLabel(method: PaymentMethod | null) {
    return (
        paymentMethods.find((item) => item.value === method)?.label ??
        method ??
        '-'
    );
}

function formatDate(iso: string | null) {
    if (!iso) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
        new Date(iso),
    );
}

function csrfToken() {
    if (typeof document === 'undefined') {
        return '';
    }

    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? ''
    );
}

// ── Banner Status ─────────────────────────────────────────────────────────────

function SubscriptionBanner({ sub }: { sub: SubscriptionInfo }) {
    if (sub.status === 'expired') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
                <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-300">
                        Langganan Anda telah kedaluwarsa
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                        Silakan berlangganan minimal paket Basic untuk
                        melanjutkan akses sistem.
                    </p>
                </div>
            </div>
        );
    }

    if (sub.is_trial || sub.plan_slug === 'free') {
        const pct = sub.max_employees
            ? Math.min(100, (sub.employee_count / sub.max_employees) * 100)
            : 0;
        return (
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" />
                        <span className="font-medium">Free Trial 30 Hari</span>
                        {sub.days_remaining > 0 && (
                            <Badge variant="secondary">
                                {sub.days_remaining} hari tersisa
                            </Badge>
                        )}
                    </div>
                    {sub.current_period_end && (
                        <span className="text-sm text-muted-foreground">
                            Berakhir: {formatDate(sub.current_period_end)}
                        </span>
                    )}
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                    Setelah trial berakhir, akun wajib berlangganan minimal
                    paket Basic.
                </p>
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Penggunaan Karyawan
                        </span>
                        <span className="font-medium">
                            {sub.employee_count} / {sub.max_employees ?? '∞'}{' '}
                            karyawan
                        </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="flex-1">
                <p className="font-medium">
                    Paket {planLabels[sub.plan_slug]} — Aktif
                </p>
                <p className="text-sm text-muted-foreground">
                    {sub.employee_count} karyawan aktif · Perpanjangan:{' '}
                    {formatDate(sub.current_period_end)}
                    {sub.days_remaining > 0 &&
                        ` · ${sub.days_remaining} hari lagi`}
                </p>
            </div>
        </div>
    );
}

// ── Upgrade Dialog ────────────────────────────────────────────────────────────

type UpgradeDialogProps = {
    open: boolean;
    onClose: () => void;
    planSlug: 'core' | 'plus';
    defaultEmployees: number;
    invoiceStoreUrl: string;
};

function UpgradeDialog({
    open,
    onClose,
    planSlug,
    defaultEmployees,
    invoiceStoreUrl,
}: UpgradeDialogProps) {
    const price = planSlug === 'core' ? PRICE_CORE : PRICE_PLUS;
    const planLabel = planSlug === 'core' ? 'Basic' : 'Plus';

    const { data, errors } = useForm({
        plan_slug: planSlug,
        employee_count: defaultEmployees,
        payment_method: 'qris' as PaymentMethod,
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upgrade ke Paket {planLabel}</DialogTitle>
                    <DialogDescription>
                        Konfirmasi jumlah karyawan untuk menghitung total
                        tagihan bulanan Anda.
                    </DialogDescription>
                </DialogHeader>

                <form
                    action={invoiceStoreUrl}
                    method="post"
                    className="space-y-4"
                >
                    <input type="hidden" name="_token" value={csrfToken()} />
                    <input
                        type="hidden"
                        name="plan_slug"
                        value={data.plan_slug}
                    />
                    <input
                        type="hidden"
                        name="payment_method"
                        value={data.payment_method}
                    />
                    <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Paket</span>
                            <span className="font-medium">{planLabel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Harga per karyawan
                            </span>
                            <span className="font-medium">
                                {fmt.format(price)}/bulan
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                            <span className="text-muted-foreground">
                                Estimasi Total
                            </span>
                            <span className="font-semibold text-primary">
                                {fmt.format(data.employee_count * price)}/bulan
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="employee_count">Jumlah Karyawan</Label>
                        <Input
                            id="employee_count"
                            name="employee_count"
                            type="number"
                            min={0}
                            value={data.employee_count}
                            readOnly
                            className="bg-muted/50"
                        />
                        <InputError message={errors.employee_count} />
                        <p className="text-xs text-muted-foreground">
                            Jumlah ini otomatis mengikuti karyawan berstatus
                            Aktif. Total:{' '}
                            {fmt.format(data.employee_count * price)} / bulan
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Metode Pembayaran</Label>
                        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                            <span>{paymentMethodLabel(data.payment_method)}</span>
                            <Badge variant="secondary">Default</Badge>
                        </div>
                        <InputError message={errors.payment_method} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={data.employee_count < 1}
                        >
                            Lanjut ke Pembayaran
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Upload Proof Dialog ───────────────────────────────────────────────────────

function UploadProofDialog({
    open,
    invoiceId,
    onClose,
    proofUrlTemplate,
}: {
    open: boolean;
    invoiceId: number | null;
    onClose: () => void;
    proofUrlTemplate: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        payment_proof: File | null;
    }>({ payment_proof: null });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!invoiceId) return;
        post(proofUrlTemplate.replace('__INVOICE_ID__', String(invoiceId)), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
                    <DialogDescription>
                        Upload foto/scan bukti transfer untuk invoice ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="proof_file">File Bukti Bayar</Label>
                        <Input
                            id="proof_file"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                                setData(
                                    'payment_proof',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={errors.payment_proof} />
                        <p className="text-xs text-muted-foreground">
                            Format: JPG, PNG, PDF. Maks 5 MB.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.payment_proof}
                        >
                            <Upload className="mr-2 size-4" />
                            {processing ? 'Mengunggah…' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Plan Features ─────────────────────────────────────────────────────────────

const coreFeaturesIncluded = [
    'Manajemen Karyawan',
    'Kehadiran & Absensi',
    'Jadwal Kerja',
    'Cuti & Izin',
    'Lembur',
    'Penggajian',
    'Notifikasi',
    'Survey',
    'Struktur Organisasi',
];

const coreFeatureLocked = [
    'Rekrutmen',
    'Performance',
    'Kasbon',
    'Asset Management',
];
const plusFeatures = [...coreFeaturesIncluded, ...coreFeatureLocked];

// ── Plan Card ─────────────────────────────────────────────────────────────────

type PlanCardProps = {
    title: string;
    priceLabel: string;
    priceDetail?: string;
    estimatedTotal?: string;
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    features: string[];
    lockedFeatures?: string[];
    isActive: boolean;
    onSelect?: () => void;
    highlight?: boolean;
};

function PlanCard({
    title,
    priceLabel,
    priceDetail,
    estimatedTotal,
    badge,
    badgeVariant = 'secondary',
    features,
    lockedFeatures,
    isActive,
    onSelect,
    highlight,
}: PlanCardProps) {
    return (
        <Card
            className={`flex flex-col ${highlight ? 'border-primary shadow-md' : ''}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {badge && (
                        <Badge
                            variant={badgeVariant}
                            className="shrink-0 text-xs"
                        >
                            {badge}
                        </Badge>
                    )}
                </div>
                <div>
                    <span className="text-3xl font-bold">{priceLabel}</span>
                    {priceDetail && (
                        <span className="ml-1 text-sm text-muted-foreground">
                            {priceDetail}
                        </span>
                    )}
                </div>
                {estimatedTotal && (
                    <CardDescription>
                        Estimasi: <strong>{estimatedTotal}</strong>/bulan
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 space-y-1.5">
                {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                        <span>{f}</span>
                    </div>
                ))}
                {lockedFeatures?.map((f) => (
                    <div
                        key={f}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                        <Lock className="size-4 shrink-0" />
                        <span>{f}</span>
                    </div>
                ))}
            </CardContent>

            <CardFooter>
                {isActive ? (
                    <Button className="w-full" disabled variant="outline">
                        Paket Aktif
                    </Button>
                ) : onSelect ? (
                    <Button
                        className="w-full"
                        variant={highlight ? 'default' : 'outline'}
                        onClick={onSelect}
                    >
                        Pilih Paket {title}
                    </Button>
                ) : null}
            </CardFooter>
        </Card>
    );
}

// ── Invoice Table ─────────────────────────────────────────────────────────────

function InvoiceTable({
    invoices,
    proofUrlTemplate,
    cancelUrlTemplate,
    paymentUrlTemplate,
}: {
    invoices: Invoice[];
    proofUrlTemplate: string;
    cancelUrlTemplate: string;
    paymentUrlTemplate: string;
}) {
    const [uploadInvoiceId, setUploadInvoiceId] = useState<number | null>(null);
    const { delete: destroy, processing: cancelling } = useForm({});

    const handleCancel = (id: number) => {
        if (!confirm('Batalkan invoice ini?')) return;
        destroy(cancelUrlTemplate.replace('__INVOICE_ID__', String(id)), {
            preserveScroll: true,
        });
    };

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center text-muted-foreground">
                <Receipt className="mb-3 size-8 opacity-40" />
                <p className="text-sm">Belum ada riwayat invoice.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No. Invoice</TableHead>
                            <TableHead>Paket</TableHead>
                            <TableHead className="text-right">
                                Karyawan
                            </TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Pembayaran</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((inv) => {
                            const sc = statusConfig[inv.status];
                            return (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono text-xs">
                                        {inv.invoice_number}
                                    </TableCell>
                                    <TableCell>
                                        {planLabels[inv.plan_slug] ??
                                            inv.plan_slug}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.employee_count}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {fmt.format(
                                            inv.total_payment ?? inv.amount,
                                        )}
                                        {inv.payment_fee > 0 && (
                                            <div className="text-xs font-normal text-muted-foreground">
                                                Fee{' '}
                                                {fmt.format(inv.payment_fee)}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[18rem] text-sm">
                                        <div className="flex items-center gap-1 font-medium">
                                            <CreditCard className="size-3.5 text-muted-foreground" />
                                            {paymentMethodLabel(
                                                inv.payment_method,
                                            )}
                                        </div>
                                        {inv.payment_number && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                QRIS tersedia
                                            </div>
                                        )}
                                        {inv.payment_expires_at && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Exp:{' '}
                                                {formatDeviceDateTime(
                                                    inv.payment_expires_at,
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sc.variant}>
                                            {sc.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDeviceDateTime(inv.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {inv.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                    disabled={!inv.payment_number}
                                                    asChild={!!inv.payment_number}
                                                    title="Bayar invoice"
                                                >
                                                    {inv.payment_number ? (
                                                        <Link
                                                            href={paymentUrlTemplate.replace(
                                                                '__INVOICE_ID__',
                                                                String(inv.id),
                                                            )}
                                                        >
                                                            <Banknote className="size-4" />
                                                            <span className="sr-only">
                                                                Bayar invoice
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <Banknote className="size-4" />
                                                            <span className="sr-only">
                                                                Bayar invoice
                                                            </span>
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() =>
                                                        setUploadInvoiceId(
                                                            inv.id,
                                                        )
                                                    }
                                                    title="Upload bukti pembayaran"
                                                >
                                                    <Upload className="size-4" />
                                                    <span className="sr-only">
                                                        Upload bukti pembayaran
                                                    </span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 w-8 p-0"
                                                    disabled={cancelling}
                                                    onClick={() =>
                                                        handleCancel(inv.id)
                                                    }
                                                    title="Batalkan invoice"
                                                >
                                                    <X className="size-4" />
                                                    <span className="sr-only">
                                                        Batalkan invoice
                                                    </span>
                                                </Button>
                                            </div>
                                        )}
                                        {inv.status === 'paid' &&
                                            inv.payment_proof && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                >
                                                    <a
                                                        href={inv.payment_proof}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Lihat Bukti
                                                    </a>
                                                </Button>
                                            )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <UploadProofDialog
                open={uploadInvoiceId !== null}
                invoiceId={uploadInvoiceId}
                onClose={() => setUploadInvoiceId(null)}
                proofUrlTemplate={proofUrlTemplate}
            />
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
    const { subscription, invoices, employee_count, billing_urls } =
        usePage<PageProps>().props;
    const [upgradeDialog, setUpgradeDialog] = useState<'core' | 'plus' | null>(
        null,
    );

    const employeeCount = employee_count ?? subscription?.employee_count ?? 0;
    const currentPlan = subscription?.plan_slug ?? 'free';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Langganan" />

            <div className="space-y-6 p-4">
                {subscription && <SubscriptionBanner sub={subscription} />}

                <section>
                    <h2 className="mb-3 text-base font-semibold">
                        Paket Langganan
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <PlanCard
                            title="Free Trial"
                            priceLabel="Gratis"
                            badge="30 HARI"
                            badgeVariant="secondary"
                            features={[
                                'Manajemen Karyawan',
                                'Kehadiran & Absensi',
                                'Jadwal Kerja',
                                'Cuti & Izin',
                                'Lembur',
                                'Notifikasi',
                                'Survey',
                                'Struktur Organisasi',
                                'Maks. 10 karyawan',
                                'Maks. 30 hari',
                            ]}
                            lockedFeatures={[
                                'Rekrutmen',
                                'Performance',
                                'Penggajian',
                                'Kasbon',
                                'Asset Management',
                            ]}
                            isActive={currentPlan === 'free'}
                        />

                        <PlanCard
                            title="Basic"
                            priceLabel={fmt.format(PRICE_CORE)}
                            priceDetail="/ karyawan / bulan"
                            estimatedTotal={fmt.format(
                                employeeCount * PRICE_CORE,
                            )}
                            features={coreFeaturesIncluded}
                            lockedFeatures={coreFeatureLocked}
                            isActive={
                                currentPlan === 'core' &&
                                subscription?.status === 'active'
                            }
                            onSelect={() => setUpgradeDialog('core')}
                        />

                        <PlanCard
                            title="Plus"
                            priceLabel={fmt.format(PRICE_PLUS)}
                            priceDetail="/ karyawan / bulan"
                            estimatedTotal={fmt.format(
                                employeeCount * PRICE_PLUS,
                            )}
                            badge="REKOMENDASI"
                            badgeVariant="default"
                            features={plusFeatures}
                            isActive={
                                currentPlan === 'plus' &&
                                subscription?.status === 'active'
                            }
                            onSelect={() => setUpgradeDialog('plus')}
                            highlight
                        />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        <Sparkles className="mr-1 inline size-3" />
                        Harga belum termasuk PPN. Pembayaran via transfer bank.
                        Invoice dibuat setelah konfirmasi.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-base font-semibold">
                        Riwayat Invoice
                    </h2>
                    <InvoiceTable
                        invoices={invoices ?? []}
                        proofUrlTemplate={billing_urls.invoice_proof_template}
                        cancelUrlTemplate={billing_urls.invoice_cancel_template}
                        paymentUrlTemplate={
                            billing_urls.invoice_payment_template
                        }
                    />
                </section>
            </div>

            {(upgradeDialog === 'core' || upgradeDialog === 'plus') && (
                <UpgradeDialog
                    open={upgradeDialog !== null}
                    onClose={() => setUpgradeDialog(null)}
                    planSlug={upgradeDialog}
                    defaultEmployees={employeeCount}
                    invoiceStoreUrl={billing_urls.invoice_store}
                />
            )}
        </AppLayout>
    );
}
